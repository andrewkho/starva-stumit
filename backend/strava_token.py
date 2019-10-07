import datetime
import logging
import sys
import urllib.parse
from typing import Optional, Dict

import aiohttp
from sanic_jwt import exceptions

import db_utils.refresh_tokens
import db_utils.user
import secrets
import user
from db_utils import dynamodb
from strava import HOST, REDIRECT_ROUTE, REQUIRED_SCOPES
from user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)

STRAVA_OAUTH_HOST = 'https://www.strava.com/oauth'


def get_identity_url() -> str:
    url = STRAVA_OAUTH_HOST + '/authorize'
    qs = urllib.parse.urlencode(query={
        'client_id': secrets.strava_client_id,
        'redirect_uri': HOST + REDIRECT_ROUTE,
        'response_type': 'code',
        'approval_prompt': 'auto',
        'scope': ','.join(REQUIRED_SCOPES),
        'state': '',
    })

    return f'{url}?{qs}'


class StravaToken(object):
    @classmethod
    def from_dict(cls, athlete_id: str, token_dict: Dict) -> 'StravaToken':
        return StravaToken(
            strava_athlete_id=athlete_id,
            access_token=token_dict['access_token'],
            refresh_token=token_dict['refresh_token'],
            expires_at=token_dict['expires_at'],
        )

    @classmethod
    async def lookup(cls, athlete_id: str) -> 'StravaToken':
        token_dict = await  _get_athlete_token_info(athlete_id)

        if token_dict is None:
            raise ValueError("Athlete not found!")

        return StravaToken.from_dict(athlete_id=athlete_id,
                                     token_dict=token_dict)

    @classmethod
    async def exchange_if_necessary(cls,
                                    token: 'StravaToken') -> 'StravaToken':
        """
        Check if this token needs refreshing, if no, simply
        return token. If yes then refresh, store, and
        return new refreshed token.

        :param token:
        :return:
        """
        if token.expires_dt <= datetime.datetime.utcnow():
            logger.info(f"token_expiry {token.expires_dt} is in the past! "
                        f"utcnow {datetime.datetime.utcnow()}. Refreshing...")
            token_dict = await _refresh_access_token(token.refresh_token)
            new_token = StravaToken.from_dict(
                athlete_id=token.athlete_id,
                token_dict=token_dict,
            )
            await _put_athlete_token_info(new_token)
            return new_token
        else:
            return token

    @classmethod
    async def create_from_code(cls, code: str) -> 'StravaToken':
        """
        Given a code after user authorizes with strava,
        exchange for tokens, store, and return the token object.

        :param code:
        :return:
        """
        token_dict = await _exchange_code_for_tokens(code)
        athlete_id = token_dict['athlete']['id']

        token = StravaToken.from_dict(athlete_id=athlete_id,
                                      token_dict=token_dict)
        await _put_athlete_token_info(token)

        return token

    def __init__(self,
                 strava_athlete_id: str,
                 access_token: str,
                 refresh_token: str,
                 expires_at: int):
        self.athlete_id = strava_athlete_id
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.expires_at = expires_at  # seconds from epoch
        self.expires_dt = datetime.datetime.fromtimestamp(self.expires_at)


async def _put_athlete_token_info(strava_token: StravaToken):
    logger.info("entered put item method")
    access_token_enc, access_token_nonce = secrets.encrypt_token(
        strava_token.access_token)
    refresh_token_enc, refresh_token_nonce = secrets.encrypt_token(
        strava_token.refresh_token)

    response = await dynamodb.put_athlete_token(item={
        'athlete_id': {'S': str(strava_token.athlete_id)},
        'expires_at': {'S': str(strava_token.expires_at)},

        'access_token_enc': {'S': access_token_enc},
        'access_token_nonce': {'S': access_token_nonce},
        'refresh_token_enc': {'S': refresh_token_enc},
        'refresh_token_nonce': {'S': refresh_token_nonce},
    })
    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        logger.error(f"Error: {str(response)}")
        raise ValueError(f"Bad status when put_athlete_token in dynamo: "
                         f"{response}")


async def _get_athlete_token_info(athlete_id: str) -> Optional[Dict]:

    response = await dynamodb.get_athlete_token(
        key={'athlete_id': {'S': athlete_id}}
    )
    # Returns 200 whether key is found or not!
    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        logger.error(f"Bad status in dynamo response: {response}")
        return None

    item = response.get('Item')
    if item is None:
        return None

    try:
        access_token = secrets.decrypt_token(
            item['access_token_enc']['S'],
            nonce=item['access_token_nonce']['S']
        )
        refresh_token = secrets.decrypt_token(
            item['refresh_token_enc']['S'],
            nonce=item['refresh_token_nonce']['S']
        )

        return {
            'strava_athlete_id': item.get('strava_athlete_id', {}).get('S'),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': int(item.get('expires_at', {}).get('S')),
        }

    except Exception as e:
        raise ValueError(f"Error interpreting entry!")


async def _refresh_access_token(refresh_token: str) -> Dict[str, str]:
    url = STRAVA_OAUTH_HOST + '/token'
    params = {
        'client_id': secrets.strava_client_id,
        'client_secret': secrets.strava_client_secret,
        'refresh_token ': refresh_token,
        'grant_type': 'refresh_token',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, params=params) as resp:
                return await resp.json()
    except Exception:
        raise ValueError("Failed to exchange backend for code")


async def _exchange_code_for_tokens(code: str) -> Dict:
    url = STRAVA_OAUTH_HOST + '/token'
    params = {
        'client_id': secrets.strava_client_id,
        'client_secret': secrets.strava_client_secret,
        'code': code,
        'grant_type': 'authorization_code',
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, params=params) as resp:
                return await resp.json()
    except Exception:
        raise ValueError("Failed to exchange backend for code")


async def authenticate(request, *args, **kwargs):
    """
    After a new client successfully authenticates with strava, call this
    endpoint with a user_id (uuid) and auth_code (from strava).

    we'll exchange the code for access tokens, get the athlete_id, and
    register this user.
    """
    # return await User.get(user_id='2e87ddc2-5c57-4f7e-b50d-b30edafcb6f3')
    try:
        user_id = request.json.get('user_id', None)
        if not user_id:
            # user_id = str(uuid.uuid4())
            user_id = '2e87ddc2-5c57-4f7e-b50d-b30edafcb6f3'
        code = request.json.get('code', None)
        if not code:
            raise exceptions.AuthenticationFailed("no code")

        token = await StravaToken.create_from_code(code)
        user = await User.register(user_id=user_id,
                                   athlete_id=token.athlete_id)

        print(f"Successfully registered user: {str(user)}")
        return user
    except Exception as e:
        raise exceptions.AuthenticationFailed(e)


async def store_refresh_token(user_id, refresh_token, *args, **kwargs):
    await db_utils.refresh_tokens.store_refresh_token(
        user_id=user_id, refresh_token=refresh_token)


async def retrieve_refresh_token(user_id, *args, **kwargs):
    return await db_utils.refresh_tokens.retrieve_refresh_token(
        user_id=user_id)

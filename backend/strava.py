import datetime
import logging
import sys
import urllib.parse
from typing import Dict, List

import aiohttp
import strava_swagger
from strava_swagger import StreamSet, Configuration

import db_utils.strava_tokens
import secrets
from user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)

STRAVA_OAUTH_HOST = 'https://www.strava.com/oauth'
HOST = 'http://localhost'
REDIRECT_ROUTE = '/admin/strava/authreturn/'

REQUIRED_SCOPES = [
    'read_all',
    'profile:read_all',
    'activity:read_all',
]


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
        token_dict = await (
            db_utils
                .strava_tokens
                .get_athlete_token_info(athlete_id)
        )

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
            await db_utils.strava_tokens.put_athlete_token_info(new_token)
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
        await db_utils.strava_tokens.put_athlete_token_info(token)

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


async def get_activities_list(user: User, start: int, end: int) -> List[Dict]:
    # This function doesn't use the swagger API because data model doesn't
    # include heart-rate summary, but the raw response does :shrug:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = 'https://www.strava.com/api/v3/athlete/activities'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    params = {
        'before': end,
        'after': start,
        'perPage': 100,
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url, params=params) as resp:
            logger.info(f"response status: {resp.status}")
            data = await resp.json()

    return data


async def get_activity_zones(user: User, activity_id: int) -> Dict:
    client = await get_strava_swagger_client(user.athlete_id)
    api = strava_swagger.ActivitiesApi(client)
    result = await api.get_zones_by_activity_id(
        id=activity_id,
    )
    return result.to_dict()


async def get_activity_details(user: User, activity_id: int) -> Dict:
    client = await get_strava_swagger_client(user.athlete_id)
    api = strava_swagger.ActivitiesApi(client)
    result = await api.get_activity_by_id(
        id=activity_id,
    )
    return result.to_dict()


async def get_activity_streams(user: User,
                               activity_id: int,
                               streamtypes: List[str]) -> Dict:
    client = await get_strava_swagger_client(user.athlete_id)
    api = strava_swagger.StreamsApi(client)
    result: StreamSet = await api.get_activity_streams(
        id=activity_id, keys=streamtypes, key_by_type=True,
    )
    return result.to_dict()


async def get_strava_swagger_client(
        athlete_id: str
) -> strava_swagger.ApiClient:
    token = await StravaToken.lookup(athlete_id=athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    conf = Configuration()
    conf.access_token = token.access_token
    client = strava_swagger.ApiClient(configuration=conf)

    # Cleanup, if you want to avoid warnings
    # await client.rest_client.pool_manager.close()

    return client


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

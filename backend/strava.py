import datetime
import logging
import sys
from typing import Dict, List

import aiohttp
import stravalib
from stravalib.model import Activity, Athlete

import db_utils.strava_athlete_tokens
import secrets
from user import User

MY_ATHLETE_ID = '42081150'

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


REQUIRED_SCOPES = [
    'read_all',
    'profile:read_all',
    'activity:read_all',
]

HOST = 'http://localhost'
REDIRECT_ROUTE = '/admin/strava/authreturn/'


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
                .strava_athlete_tokens
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
            new_token = await _refresh_access_token(token)
            await (
                db_utils
                .strava_athlete_tokens
                .put_athlete_token_info(new_token)
            )
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
        client = stravalib.client.Client()

        try:
            tokens = client.exchange_code_for_token(
                client_id=secrets.strava_client_id,
                client_secret=secrets.strava_client_secret,
                code=code,
            )
        except Exception:
            raise ValueError("Failed to exchange backend for code")

        try:
            athlete_id = await get_athlete_id(tokens['access_token'])
        except Exception:
            raise ValueError("Failed to get athlete_id with access token")

        token = StravaToken.from_dict(athlete_id=athlete_id,
                                      token_dict=tokens)
        await db_utils.strava_athlete_tokens.put_athlete_token_info(token)

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


async def get_identity_url() -> str:
    client = stravalib.client.Client()
    return client.authorization_url(
        client_id=secrets.strava_client_id,
        redirect_uri=HOST + REDIRECT_ROUTE,
        approval_prompt='auto',
        scope=REQUIRED_SCOPES,  # This actually requires List[str]
        state='',
    )


async def get_athlete_id(access_token: str) -> str:
    client = stravalib.client.Client(access_token=access_token)
    athlete: Athlete = client.get_athlete()

    return athlete.id


async def get_activities(user: User, start: int, end: int) -> List[Activity]:
    """

    :param user: User object with athlete_id
    :param start: start of range in seconds from epoch
    :param end: end of range in seconds from epoch
    :return:
    """
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    client = stravalib.client.Client(access_token=token.access_token)

    # strava.get_activities wants ranges in datetimes
    after = datetime.datetime.fromtimestamp(start)
    before = datetime.datetime.fromtimestamp(end)
    activities = [_ for _ in client.get_activities(after=after,
                                                   before=before)]
    return activities


async def get_activities_list(user: User, start: int, end: int) -> List[Dict]:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = 'https://www.strava.com/api/v3/athlete/activities'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    params = {
        'before': end,
        'after': start,
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url, params=params) as resp:
            logger.info(f"response status: {resp.status}")
            data = await resp.json()

    return data


async def get_activity_zones(user: User, activity_id: int) -> Dict:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = f'https://www.strava.com/api/v3/activities/{activity_id}/zones'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            logger.info(f"response status: {resp.status}")
            data = await resp.json()

    return data


async def get_activity_details(user: User, activity_id: int) -> Dict:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = f'https://www.strava.com/api/v3/activities/{activity_id}/'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url) as resp:
            logger.info(f"response status: {resp.status}")
            data = await resp.json()

    return data


async def get_activity_streams(user: User,
                               activity_id: int,
                               streamtypes: List[str]) -> Dict:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = f'https://www.strava.com/api/v3/activities/{activity_id}/streams'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    params = {
        "keys": ','.join(streamtypes),
        "keyByType": 'true',
    }
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url, params=params) as resp:
            logger.info(f"response status: {resp.status}")
            data = await resp.json()

    return data


async def _refresh_access_token(strava_token: StravaToken) -> StravaToken:
    client = stravalib.client.Client()
    new_tokens = client.refresh_access_token(
        client_id=secrets.strava_client_id,
        client_secret=secrets.strava_client_secret,
        refresh_token=strava_token.refresh_token,
    )

    return StravaToken.from_dict(athlete_id=strava_token.athlete_id,
                                 token_dict=new_tokens)

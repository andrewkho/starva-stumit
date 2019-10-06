import datetime
import logging
import sys
from typing import Dict, List

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

    async def get_new_tokens(self):
        new_token = await refresh_access_token(self)

        self.athlete_id = new_token.athlete_id
        self.access_token = new_token.access_token
        self.refresh_token = new_token.access_token
        self.expires_at = new_token.expires_at
        self.expires_dt = datetime.datetime.fromtimestamp(self.expires_at)

    async def get_valid_access_token(self) -> str:
        """
        Returns a valid access token. If current token expired,
        fetches a new one

        :return: valid access_token
        """
        if self.expires_dt <= datetime.datetime.utcnow():
            logger.info(f"token_expiry {self.expires_dt} is in the past! "
                        f"utcnow {datetime.datetime.utcnow()}. Refreshing...")
            await self.get_new_tokens()

        return self.access_token


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


async def get_activities(user: User) -> List[Activity]:
    token = await db_utils.strava_athlete_tokens.get_athlete_token_info(
        athlete_id=user.athlete_id)
    client = stravalib.client.Client(
        access_token=await token.get_valid_access_token())

    activities = [_ for _ in client.get_activities(limit=10)]

    return activities


async def exchange_code_for_token(code: str) -> StravaToken:
    logger.info(f"Server received code: {code}")
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

    return StravaToken.from_dict(athlete_id=athlete_id,
                                 token_dict=tokens)


async def refresh_access_token(strava_token: StravaToken) -> StravaToken:
    client = stravalib.client.Client()
    new_tokens = client.refresh_access_token(
        client_id=secrets.strava_client_id,
        client_secret=secrets.strava_client_secret,
        refresh_token=strava_token.refresh_token,
    )

    return StravaToken.from_dict(athlete_id=strava_token.athlete_id,
                                 token_dict=new_tokens)

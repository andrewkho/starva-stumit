import logging
import sys
from typing import Dict, List

import aiohttp
import strava_swagger
from strava_swagger import StreamSet, Configuration

from strava_token import StravaToken
from user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


async def get_activities_list(user: User, start: int, end: int) -> List[Dict]:
    # This function doesn't use the swagger API because data model doesn't
    # include heart-rate summary, but the raw response does :shrug:
    token = await StravaToken.lookup(athlete_id=user.athlete_id)
    token = await StravaToken.exchange_if_necessary(token)

    url = 'https://www.strava.com/api/v3/athlete/activities'

    headers = {
        'Authorization': f'Bearer {token.access_token}'
    }
    per_page = 50
    curr_page = 1
    data = []
    while True:
        params = {
            'before': end,
            'after': start,
            'per_page': per_page,
            'page': curr_page,
        }
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.get(url, params=params) as resp:
                logger.info(f"response status: {resp.status}")
                page_data = await resp.json()
        data.extend(page_data)
        if len(page_data) == per_page:
            curr_page += 1
            continue
        else:
            break

    return data


async def get_athlete_zones(user: User) -> Dict:
    client = await get_strava_swagger_client(user.athlete_id)
    api = strava_swagger.AthletesApi(client)
    result = await api.get_logged_in_athlete_zones()
    return result.to_dict()


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

import logging
import sys
from typing import Optional, Dict

import secrets
from db_utils import dynamodb
from strava import StravaToken

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


async def put_athlete_token_info(strava_token: StravaToken):
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


async def get_athlete_token_info(athlete_id: str) -> Optional[Dict]:

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




import logging
import sys
from typing import Dict

from db_utils import dynamodb
from user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


async def get_user(user_id: str) -> Dict[str, str]:
    response = await dynamodb.get_user(
        key={'user_id': {'S': str(user_id)}}
    )

    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error getting user info for "
                         f"user_id: {user_id}")

    item = response.get('Item', None)
    if not item:
        raise ValueError(f"User not found! Got user_id: {user_id}")

    user_dict = dict()
    user_dict['user_id'] = item['user_id']['S']
    user_dict['athlete_id'] = item['athlete_id']['S']

    return user_dict


async def put_user(user: User):
    response = await dynamodb.put_user(
        item={
            'user_id': {'S': str(user.user_id)},
            'athlete_id': {'S': str(user.athlete_id)},
        })
    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error saving user info for "
                         f"user: {str(user)}")

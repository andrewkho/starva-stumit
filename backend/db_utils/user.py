import logging
import sys
from typing import Dict

import secrets
from db_utils import db_access
from user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)

USER_REFRESH_TOKENS = 'letsplayfootsy.user_refresh_tokens'
USER_TABLE = 'letsplayfootsy.users'


async def get_user(user_id: str) -> Dict[str, str]:
    client = db_access.get_dynamo_client()
    response = await client.get_item(
        TableName=USER_TABLE,
        Key={'user_id': {'S': str(user_id)}}
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
    print("getting dynamo client")
    client = db_access.get_dynamo_client()
    print("await put_item")
    response = await client.put_item(
        TableName=USER_TABLE,
        Item={
            'user_id': {'S': str(user.user_id)},
            'athlete_id': {'S': str(user.athlete_id)},
        }
    )
    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error saving user info for "
                         f"user: {str(user)}")


async def store_refresh_token(user_id: str, refresh_token: str):
    refresh_token_enc, nonce = secrets.encrypt_token(refresh_token)

    async with db_access.get_dynamo_client() as client:
        response = await client.put_item(
            TableName=USER_REFRESH_TOKENS,
            Item={
                'user_id': {'S': str(user_id)},
                'refresh_token_enc': {'S': str(refresh_token_enc)},
                'refresh_token_nonce': {'S': str(nonce)},
            }
        )

    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error storing refresh token for "
                         f"user_id: {user_id}")


async def retrieve_refresh_token(user_id: str) -> str:
    async with db_access.get_dynamo_client() as client:
        response = await client.get_item(
            TableName=USER_REFRESH_TOKENS,
            Key={'user_id': {'S': str(user_id)}}
        )

    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error retrieving refresh token for "
                         f"user_id: {user_id}")

    item = response.get('Item')
    refresh_token = secrets.decrypt_token(
        item['refresh_token_nonce']['S'],
        nonce=item['refresh_token_nonce']['S']
    )

    return refresh_token


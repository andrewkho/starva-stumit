import secrets
from db_utils import dynamodb


async def store_refresh_token(user_id: str, refresh_token: str):
    refresh_token_enc, nonce = secrets.encrypt_token(refresh_token)

    response = await dynamodb.put_refresh_token(
        item={
            'user_id': {'S': str(user_id)},
            'refresh_token_enc': {'S': str(refresh_token_enc)},
            'refresh_token_nonce': {'S': str(nonce)},
        })

    if response.get('ResponseMetadata', {}).get('HTTPStatusCode') != 200:
        raise ValueError(f"Error storing refresh token for "
                         f"user_id: {user_id}")


async def retrieve_refresh_token(user_id: str) -> str:
    response = await dynamodb.get_refresh_token(
        key={'user_id': {'S': str(user_id)}}
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

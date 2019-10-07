import asyncio

import aiobotocore

import secrets
from run_mode import RUN_MODE

STRAVA_ATHLETE_TOKENS = 'strava_athlete_tokens'
USER_REFRESH_TOKENS = 'letsplayfootsy.user_refresh_tokens'
USER_TABLE = 'letsplayfootsy.users'


if RUN_MODE == 'local':
    def get_dynamo_client():
        session = aiobotocore.get_session(loop=asyncio.get_event_loop())
        return session.create_client(
            service_name='dynamodb',
            aws_access_key_id=secrets.aws_access_key,
            aws_secret_access_key=secrets.aws_secret_access_key,
            region_name='us-west-1',
        )
else:
    def get_dynamo_client():
        session = aiobotocore.get_session(loop=asyncio.get_event_loop())
        return session.create_client(
            service_name='dynamodb'
        )


async def put_athlete_token(item):
    async with get_dynamo_client() as client:
        response = await client.put_item(
            TableName=STRAVA_ATHLETE_TOKENS,
            Item=item
        )

        return response


async def get_athlete_token(key):
    async with get_dynamo_client() as client:
        response = await client.get_item(
            TableName=STRAVA_ATHLETE_TOKENS,
            Key=key,
        )

        return response


async def put_user(item):
    async with get_dynamo_client() as client:
        response = await client.put_item(
            TableName=USER_TABLE,
            Item=item,
        )

        return response


async def get_user(key):
    async with get_dynamo_client() as client:
        response = await client.get_item(
            TableName=USER_TABLE,
            Key=key,
        )

        return response


async def put_refresh_token(item):
    async with get_dynamo_client() as client:
        response = await client.put_item(
            TableName=USER_REFRESH_TOKENS,
            Item=item,
        )

        return response


async def get_refresh_token(key):
    async with get_dynamo_client() as client:
        response = await client.get_item(
            TableName=USER_REFRESH_TOKENS,
            Key=key,
        )

        return response



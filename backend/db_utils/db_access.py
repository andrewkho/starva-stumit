import asyncio

import aiobotocore

import secrets
from run_mode import RUN_MODE

_dynamo_client = None

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

import stravalib


async def get_identity_url():
    client = stravalib.client.Client(access_token='access_token')

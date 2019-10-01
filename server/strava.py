import stravalib

import secrets

REQUIRED_SCOPES = [
    'read_all',
    'profile:read_all',
    'activity:read_all',
]

REDIRECT_URI = 'https://developers.strava.com'


async def get_identity_url() -> str:
    client = stravalib.client.Client()
    return client.authorization_url(
        client_id=secrets.strava_client_id,
        redirect_uri=REDIRECT_URI,
        approval_prompt='auto',
        scope=REQUIRED_SCOPES,  # This actually requires List[str]
        state='',
    )

import yaml

SECRETS_FILE = '/run/secrets/my_secret'
with open(SECRETS_FILE, 'r') as f:
    SECRETS = yaml.safe_load(f)

EXPECTED_KEYS = ['strava_client_id',
                 'strava_client_secret']

if any([k not in SECRETS for k in EXPECTED_KEYS]):
    raise ValueError(f"Secrets file requires keys {EXPECTED_KEYS}")

strava_client_id = SECRETS['strava_client_id']
strava_client_secret = SECRETS['strava_client_secret']

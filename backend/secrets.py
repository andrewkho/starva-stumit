from typing import Tuple

import yaml
from Crypto.Cipher import AES

SECRETS_FILE = '/run/secrets/my_secret'
STRAVA_TOKEN_KEY_FILE = '/run/secrets/strava_token_key_bin'

with open(SECRETS_FILE, 'r') as f:
    SECRETS = yaml.safe_load(f)

with open(STRAVA_TOKEN_KEY_FILE, 'rb') as f:
    strava_token_key = f.read()

EXPECTED_KEYS = ['strava_client_id',
                 'strava_client_secret']

if any([k not in SECRETS for k in EXPECTED_KEYS]):
    raise ValueError(f"Secrets file requires keys {EXPECTED_KEYS}")

strava_client_id = SECRETS['strava_client_id']
strava_client_secret = SECRETS['strava_client_secret']
aws_access_key = SECRETS['aws_access_key']
aws_secret_access_key = SECRETS['aws_secret_access_key']

jwt_secret = SECRETS['jwt_secret']

_encoding = 'UTF-8'


def encrypt_token(token: str) -> Tuple[str, str]:
    """
    encrypt token using aes

    :param token: token to encrypt
    :return: ciphertext, nonce
    """

    cipher = AES.new(strava_token_key, AES.MODE_EAX)
    nonce = cipher.nonce
    ciphertext, tag = cipher.encrypt_and_digest(
        token.encode(encoding=_encoding))

    return ciphertext.hex(), nonce.hex()


def decrypt_token(ciphertext: str, nonce: str) -> str:
    f"""
    decrypt ciphertext given nonce. Returns a {_encoding} encoded string
    
    :param ciphertext: 
    :param nonce: 
    :return: 
    """

    cipher = AES.new(strava_token_key,
                     AES.MODE_EAX,
                     nonce=bytes.fromhex(nonce))

    decrypted = cipher.decrypt(bytes.fromhex(ciphertext))

    return decrypted.decode(_encoding)

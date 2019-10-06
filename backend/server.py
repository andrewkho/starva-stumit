import logging
import sys

from sanic import Sanic
from sanic.response import json
from sanic_jwt import Initialize, inject_user, protected

import auth
import secrets
import strava

app = Sanic()
Initialize(
    app,
    url_prefix='/api/auth',
    secret=secrets.jwt_secret,
    cookie_httponly=True,
    cookie_set=True,
    cookie_domain='localhost',
    cookie_access_token_name='letsplayfootsy-jwt',
    expiration_delta=60 * 24 * 10000,  # 10000 days
    authenticate=auth.authenticate,
    retrieve_user=auth.retrieve_user,
    # refresh_token_enabled=True,
    # store_refresh_token=auth.store_refresh_token,
    # retrieve_refresh_token=auth.retrieve_refresh_token,
)

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.INFO)


@app.route("/")
async def test(request):
    return json({"hello": "andrew"})


@app.route("/api/v1/strava_auth_url")
async def strava_auth_url(request):
    return json({
        "auth_url": await strava.get_identity_url(),
    })


@app.route("api/v1/get_activities", methods=['POST'])
@inject_user()
@protected()
async def get_activities(request, user: auth.User):
    try:
        start = int(request.json['start'])
        end = int(request.json['end'])
    except Exception as e:
        raise ValueError("Request must include start and end integers! "
                         f"Got request: {str(request.json)}")

    activities = await strava.get_activities(user=user,
                                             start=start,
                                             end=end)

    logger.info(f"Got activities: {[a.name for a in activities]}")

    return json({
        "activities": [
            a.to_dict()
            for a in activities
        ]
    })

# Route for fetching data for plotting?

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

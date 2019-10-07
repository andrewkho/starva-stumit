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

    activities = await strava.get_activities_list(
        user=user, start=start, end=end)

    return json(activities)


@app.route("api/v1/get_activity_zones", methods=['POST'])
@inject_user()
@protected()
async def get_activity_zones(request, user: auth.User):
    try:
        activity_id=int(request.json['activity_id'])
    except Exception as e:
        raise ValueError("Request must include activity_id! "
                         f"Got request: {str(request.json)}")

    logger.info(f"got activity_id: {activity_id}")

    activity_zones = await strava.get_activity_zones(
        user=user, activity_id=activity_id)

    logger.info(f"Got activity zones: {str(activity_zones)}")

    return json(activity_zones)


@app.route("api/v1/get_activity_details", methods=['POST'])
@inject_user()
@protected()
async def get_activity_zones(request, user: auth.User):
    try:
        activity_id=int(request.json['activity_id'])
    except Exception as e:
        raise ValueError("Request must include activity_id! "
                         f"Got request: {str(request.json)}")

    logger.info(f"got activity_id: {activity_id}")

    activity_details = await strava.get_activity_details(
        user=user, activity_id=activity_id)

    logger.info(f"Got activity details: {str(activity_details)}")

    return json(activity_details)


@app.route("api/v1/get_activity_streams", methods=['POST'])
@inject_user()
@protected()
async def get_activity_streams(request, user: auth.User):
    try:
        activity_id=int(request.json['activity_id'])
        logger.info(f"got activity_id: {activity_id}")
    except Exception as e:
        raise ValueError("Request must include activity_id! "
                         f"Got request: {str(request.json)}")

    try:
        streamtypes = request.json['streamtypes']
        logger.info(f"streamtypes requested: {streamtypes}")
    except Exception:
        raise ValueError("Request must include list of strings streamtypes! "
                         f"Got request: {str(request.json)}")

    activity_streams = await strava.get_activity_streams(
        user=user, activity_id=activity_id, streamtypes=streamtypes)

    logger.info(f"Got activity streams: {[_['type'] for _ in activity_streams]}")

    return json(activity_streams)

# Route for fetching data for plotting?

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

import logging
import sys

from sanic import Sanic
from sanic.response import json
from sanic_cors import CORS

import db_utils
import strava

app = Sanic()
CORS(app)

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


@app.route("api/v1/submit_code", methods=['POST'])
async def submit_code(request):
    token = await strava.exchange_code_for_token(request.json['code'])
    await db_utils.put_athlete_token_info(strava_token=token)

    return json({
        "code_received": request.json['code'],
    })

@app.route("api/v1/get_activities", methods=['POST'])
async def get_activities(request):
    token = await db_utils.get_athlete_token_info(
        athlete_id=strava.MY_ATHLETE_ID)
    activities = await strava.get_activities(token=token)

    logger.info(f"Got activities: {[a.name for a in activities]}")

    return json({
        "activities": [
            {
                'id': a.id,
                'name': a.name,
            }
            for a in activities
        ]
    })

# Route for callback from strava when new activity

# Route for fetching data for plotting?

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

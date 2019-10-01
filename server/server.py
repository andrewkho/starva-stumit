from sanic import Sanic
from sanic.response import json

import strava

app = Sanic()


@app.route("/")
async def test(request):
    return json({"hello": "world"})


@app.route("/strava_auth_url")
async def strava_auth_url(request):
    return json({
        "auth_url": await strava.get_identity_url(),
    })

# Route for callback from strava when new activity

# Route for fetching data for plotting?

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

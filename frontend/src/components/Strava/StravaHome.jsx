import React, { Component } from "react";
import { Button } from "react-bootstrap";
import {Redirect} from "react-router";
import qs from "query-string";

const host = "http://localhost";
const get_activities_route = "/api/v1/get_activities";

async function get_activities() {
  const resp = await fetch(host + get_activities_route,{
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    return response
  }).catch((error) => {
    console.log(error)
  });

  if (!resp.ok) {
    console.log("Error when getting activities " + JSON.stringify(resp.json()))
  }

  return resp.activities;
}

class StravaHome extends Component {
  render() {
    console.log("stringify: " + JSON.stringify(this.props));
    const activities = get_activities();
    if (activities) {
      console.log("activities: " + JSON.stringify(activities))
    }
    return (
      <div> Strava Home {JSON.stringify(this.activites)} </div>
    )
  }
}

export default StravaHome;

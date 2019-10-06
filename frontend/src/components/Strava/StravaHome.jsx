import React, { Component } from "react";
import StravaActivitiesPage from "./StravaActivitiesPage";
import Grid from "react-bootstrap/lib/Grid";
import Row from "react-bootstrap/lib/Row";


class StravaHome extends Component {
  render() {
    return (
      <Grid fluid>
        <Row>
          <div> Strava Home </div>
        </Row>
        <Row>
          <div>{<StravaActivitiesPage />}</div>
        </Row>
      </Grid>
    )
  }
}

export default StravaHome;

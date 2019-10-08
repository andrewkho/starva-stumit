import React from "react";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";

class StravaAuthFailed extends React.Component {
  render() {
    return (
      <Jumbotron fluid>
        <h1>Strava authorization failed!</h1>
        <LinkContainer to="/strava">
          <Button>Back to STumit</Button>
        </LinkContainer>
      </Jumbotron>
    )
  }
}

export default StravaAuthFailed;

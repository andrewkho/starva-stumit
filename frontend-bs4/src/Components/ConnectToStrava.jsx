import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const host = "http://localhost";
const get_strava_auth = "/api/v1/strava_auth_url";

class ConnectToStrava extends Component {
  async get_auth() {
    const auth_url = await fetch(host + get_strava_auth,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then((response) => {
        return response.json()
      })
      .catch((error) => {
        console.log(error)
      });
    console.log("redirecting to " + JSON.stringify(auth_url));
    console.log("auth_url: " + auth_url.auth_url);
    window.location.replace(auth_url.auth_url);
  }

  render() {
    return(
      <Container>
        <Row>
          <h1>We need you to login to strava to continue!</h1>
        </Row>
        <Row>
          <Button onClick={this.get_auth}>{this.props.label}</Button>
        </Row>
      </Container>
    )
  }

}

export default ConnectToStrava;

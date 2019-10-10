import React from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

import { LinkContainer } from 'react-router-bootstrap'

import Button from "react-bootstrap/Button";


class FourOhFour extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <h1> 404 Uh oh! page not found</h1>
        </Row>
        <Row>
          <LinkContainer to="/strava">
            <Button>Back to STumit</Button>
          </LinkContainer>
        </Row>
      </Container>
    )
  }
}

export default FourOhFour;

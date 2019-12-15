import React from "react";
import Row from "react-bootstrap/Row";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import StravaActivitiesPage from "./StravaActivitiesPage";
import Nav from "react-bootstrap/Nav";


class StravaHome extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <StravaActivitiesPage {...this.props}/>
        </Row>
      </Container>
    )
  }
}

export default StravaHome;

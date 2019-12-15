import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {withRouter} from "react-router";

class StravaNavbarBase extends React.Component {
  render() {
    return(
      <Navbar expand="lg" variant="light" bg="light">
        <Navbar.Brand href="/strava">Starva STumit</Navbar.Brand>
          <Nav className="mr-auto" activeKey={this.props.location.pathname}>
            <Nav.Item>
              <Nav.Link href="/strava/activities" activeClassName="active">Activities</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/strava/trends" activeClassName="active">Trends</Nav.Link>
            </Nav.Item>
          </Nav>
      </Navbar>
    )
  }
}

const StravaNavbar = withRouter(StravaNavbarBase);

export default StravaNavbar;

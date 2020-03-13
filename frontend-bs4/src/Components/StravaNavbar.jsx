import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {withRouter} from "react-router";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";

class StravaNavbarBase extends React.Component {
  render() {
    return(
      <Navbar expand="lg" variant="light" bg="light">
        <Navbar.Brand href="/strava">Starva STumit</Navbar.Brand>
          <Nav className="mr-auto" activeKey={this.props.location.pathname}>
            <Nav.Item>
              <Nav.Link href="/strava/activities">Activities</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/strava/trends">Trends</Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav>
            <ToggleButtonGroup type="radio" name="units" defaultValue="imperial" onChange={this.props.onUnitsChange}>
              <ToggleButton value="imperial"> Imperial </ToggleButton>
              <ToggleButton value="metric"> Metric </ToggleButton>
            </ToggleButtonGroup>
          </Nav>
          <Navbar.Text>
            <a href="https://github.com/andrewkho/starva-stumit">&emsp;See the source on Github!</a>
          </Navbar.Text>
      </Navbar>
    )
  }
}

const StravaNavbar = withRouter(StravaNavbarBase);

export default StravaNavbar;

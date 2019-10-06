/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from "react-bootstrap";

import ConnectToStrava from "components/Strava/ConnectToStrava";
import verify_jwt from "components/Strava/VerifyJwt"
import StravaHome from "components/Strava/StravaHome";


class Strava extends Component {
  constructor(props) {
    super(props);

    this.state = { to_display: '' };
  }

  async componentDidMount() {
    let verified = await verify_jwt();
    console.log("verified: " + verified);
    if (verified) {
      console.log("Successfully verified jwt!");
      this.setState({
        to_display: <StravaHome />
      });
    } else {
      console.log("Failed to verify jwt!");
      this.setState({
        to_display: <ConnectToStrava label="Connect To Strava"/>
      });
    }
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            {this.state.to_display}
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Strava;

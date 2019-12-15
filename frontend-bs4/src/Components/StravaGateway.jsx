import * as React from "react";
import verify_jwt from "./VerifyJwt";
import ConnectToStrava from "./ConnectToStrava";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import {Redirect} from "react-router-dom";


class StravaGateway extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      verified: null,
      loading: true,
    };
  }

  async componentDidMount() {
    let verified = await verify_jwt();
    console.log("verified: " + verified);
    if (verified) {
      console.log("Successfully verified jwt!");
      this.setState({
        verified: true,
        loading: false,
      });
    } else {
      console.log("Failed to verify jwt!");
      this.setState({
        verified: false,
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <Container>
          <Spinner animation="border"/> Attempting to log you in...
        </Container>
      )
    } else {
      return (
        <div>
        {
          this.state.verified ?
            <Redirect to="/strava/activities" /> :
            <ConnectToStrava />
        }
        </div>
      );
    }
  }
}

export default StravaGateway;

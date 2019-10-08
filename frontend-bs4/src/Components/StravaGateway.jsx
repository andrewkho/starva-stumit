import * as React from "react";
import verify_jwt from "./VerifyJwt";
import StravaHome from "./StravaHome";
import ConnectToStrava from "./ConnectToStrava";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";


class StravaGateway extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      to_display: '',
      loading: true,
    };
  }

  async componentDidMount() {
    let verified = await verify_jwt();
    console.log("verified: " + verified);
    if (verified) {
      console.log("Successfully verified jwt!");
      this.setState({
        to_display: <StravaHome />,
        loading: false,
      });
    } else {
      console.log("Failed to verify jwt!");
      this.setState({
        to_display: <ConnectToStrava label="Connect To Strava"/>,
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
          this.state.to_display
      );
    }
  }
}

export default StravaGateway;

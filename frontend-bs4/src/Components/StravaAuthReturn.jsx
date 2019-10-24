import axios from "axios";
import React from "react";
import {Redirect} from "react-router-dom";
import qs from "query-string";
import Spinner from "react-bootstrap/Spinner";


async function authorize(code) {
  return await axios.post( "/api/auth", {
    code: code,
  }).then(resp => {
    console.log("Submitting code success! " + JSON.stringify(resp));
    console.log("payload: " + resp.data.access_token);

    return resp
  }).catch((error) => {
    console.error("Error when submitting code " + error)
  });
}

class StravaAuthReturn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waiting_for_auth: true,
      authorized: false,
    }
  }

  async componentDidMount() {
    console.log("stringify: " + JSON.stringify(this.props));
    const query_params = qs.parse(this.props.location.search);
    console.log("query_params: " + JSON.stringify(query_params));

    if (query_params.code) {
      console.log("Successfully authenticated with strava, trying to register");
      console.log("code: " + query_params.code);

      await authorize(query_params.code)
        .then(resp => {
          if (resp) {
            console.log("Successfully registered! " + resp);
            this.setState({waiting_for_auth: false, authorized: true});
          } else {
            console.error("Registration failed! " + resp);
            this.setState({waiting_for_auth: false, authorized: false});
          }
        })
        .catch(err => {
          console.error("Registration failed with error! " + err);
          this.setState({waiting_for_auth: false, authorized: false});
        });
    } else {
      if (query_params.error) {
        console.log("Error when authenticating with strava: " + query_params.error);
        this.setState({waiting_for_auth: false, authorized: false})
      } else {
        console.log("Unknown error! " + JSON.stringify(query_params));
        this.setState({waiting_for_auth: false, authorized: false})
      }
    }
  }

  render() {
    if (this.state.waiting_for_auth) {
      return (
        <div className="content">
          <h1><Spinner animation="border" /> Checking credentials...</h1>
        </div>
      );
    } else {
      return (
        <div className="content">
          {
            this.state.authorized ?
              <Redirect to="/strava"/> :
              <Redirect to="/strava/authfailed"/>
          }
        </div>
        // window.location.replace(auth_url.auth_url);
      )
    }
  }
}

export default StravaAuthReturn;

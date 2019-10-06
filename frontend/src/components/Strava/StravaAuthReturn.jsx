import axios from "axios";
import React, {Component} from "react";
import {Redirect} from "react-router";
import qs from "query-string";

const host = "http://localhost";
const authorize_route = "/api/auth";

async function authorize(code) {
  return await axios.post(host + authorize_route, {
    code: code,
  }).then(resp => {
    console.log("Submitting code success! " + JSON.stringify(resp));
    console.log("payload: " + resp.data.access_token);

    // TODO: try and figure out how to get set-cookies header to work!
    const cookie_name = "letsplayfootsy-jwt";
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000*36000;
    now.setTime(expireTime);

    document.cookie = cookie_name + "=" + resp.data.access_token + ";" + now.toGMTString() + ";path=/";

    return resp
  }).catch((error) => {
    console.error("Error when submitting code " + error)
  });
}

class StravaAuthReturn extends Component {
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
          <title>Checking credentials...</title>
        </div>
      );
    } else {
      return (
        <div className="content">
          {
            this.state.authorized ?
              <Redirect to="/admin/strava/"/> :
              <Redirect to="/admin/strava/auth_failed"/>
          }
        </div>
        // window.location.replace(auth_url.auth_url);
      )
    }
  }
}

export default StravaAuthReturn;

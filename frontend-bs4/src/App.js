import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Container from "react-bootstrap/Container";

import StravaAuthReturn from "./Components/StravaAuthReturn";
import FourOhFour from "./Components/FourOhFour";
import StravaAuthFailed from "./Components/StravaAuthFailed";
import StravaGateway from "./Components/StravaGateway";
import ActivityDetail from "./Components/ActivityDetail";
import StravaNavbar from "./Components/StravaNavbar";
import StravaTrends from "./Components/StravaTrends";
import StravaActivitiesPage from "./Components/StravaActivitiesPage";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      metric: false,
    };
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Container>
            <StravaNavbar onUnitsChange={(units) => {
              console.log("Units changed to " + units);
              this.setState({
                metric: units !== "imperial",
              });
            }}/>
            <Switch>
              <Route exact path="/" component={StravaGateway} />
              <Route exact path="/strava" component={StravaGateway} />
              <Route path="/strava/activities"
                     render={(props) => <StravaActivitiesPage {...props} metric={this.state.metric}/>} />
              <Route path="/strava/trends"
                     render={(props) => <StravaTrends {...props} />} />
              <Route path="/strava/activity"
                     render={(props) => <ActivityDetail {...props} metric={this.state.metric} />} />
              <Route path="/strava/authreturn" component={StravaAuthReturn} />
              <Route path="/strava/authfailed" component={StravaAuthFailed} />
              <Route component={FourOhFour} />
            </Switch>
          </Container>
        </div>
      </Router>
    )
  }
}

export default App;

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
  render() {
    return (
      <Router>
        <div className="App">
          <Container>
            <StravaNavbar />

            <Switch>
              <Route exact path="/" component={StravaGateway} />
              <Route exact path="/strava" component={StravaGateway} />
              <Route path="/strava/activities" component={StravaActivitiesPage} />
              <Route path="/strava/trends" component={StravaTrends} />
              <Route path="/strava/activity" component={ActivityDetail} />
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

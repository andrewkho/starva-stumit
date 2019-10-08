import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import StravaAuthReturn from "./Components/StravaAuthReturn";
import StravaHome from "./Components/StravaHome";
import FourOhFour from "./Components/FourOhFour";

function App() {
  return (
    <Router>
      <div className="App">
        {/*<header className="App-header">*/}
        {/*  <img src={logo} className="App-logo" alt="logo" />*/}
        {/*  <p>*/}
        {/*    Edit <code>src/App.js</code> and save to reload.*/}
        {/*  </p>*/}
        {/*  <a*/}
        {/*    className="App-link"*/}
        {/*    href="https://reactjs.org"*/}
        {/*    target="_blank"*/}
        {/*    rel="noopener noreferrer"*/}
        {/*  >*/}
        {/*    Learn React*/}
        {/*  </a>*/}
        {/*</header>*/}
      <Switch>
        <Route path="/strava/" component={StravaHome} />
        <Route path="/strava/authreturn/" render={props => <StravaAuthReturn {...props} />} />
        <Route component={FourOhFour} />
        <Redirect from="/" to="/strava" />
      </Switch>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Graph from './App';
import Home from './homePage';

const Routes = () => (
  <Router>
    <Switch>
      <Route path="/graph" exact component={Graph} />
      <Route paht="/" exact component={Home} />
      <Redirect path="*" to="/" />
    </Switch>
  </Router>
);

export default Routes;

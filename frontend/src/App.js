import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import * as Sentry from "@sentry/react";

import './App.css';
import HomePage from './pages/Home';
import GamePage from './pages/Game';

function App() {
  return (
    <Sentry.ErrorBoundary fallback={"An error has occurred"}>
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/" component={HomePage} exact/>
            <Route path="/game/:gameId" component={GamePage}/>
          </Switch>
        </div>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;
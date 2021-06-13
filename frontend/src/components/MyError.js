import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';

export default class MyError extends Component {
  render() {
    return (
      <div>
        <button
          onClick={this.handleClick}
        >
          Error
        </button>
      </div>
    )
  }

  handleClick = () => {
    try {
      throw new Error('Caught');
    } catch (err) {
      Sentry.captureException(err);
    }
  }
}
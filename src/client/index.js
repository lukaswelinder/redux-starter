import 'babel-polyfill';

import React from 'react';
import { fromJS } from 'immutable';
import { hydrate } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Redbox from 'redbox-react';
import createHistory from 'history/createBrowserHistory';
import { I18nextProvider } from 'react-i18next';

import Root from './root';
import ApiClient from './../helpers/ApiClient';
import i18n from '../helpers/i18n';
import getRoutes from './../app/routes';
import config from './../app/config';
import configureStore from './../app/redux/store';

const client = new ApiClient();
const initialState = fromJS(window.__INITIAL_STATE__);
const history = createHistory();
const store = configureStore(history, client, initialState);
const dest = document.getElementById('root');

const hydrateApp = renderProps => hydrate(
  <AppContainer
    errorReporter={Redbox}
  >
    <I18nextProvider
      i18n={i18n}
      initialLanguage={window.__INITIAL_STATE__.internationalization.lang.value}
      initialI18nStore={window.__INITIAL_STATE__.internationalization.initialI18nStore}
    >
      <Root
        {...renderProps}
      />
    </I18nextProvider>
  </AppContainer>,
  dest
);

hydrateApp({
  routes: getRoutes(store),
  store,
  history
});

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (
    !config.ssr
    &&
    (!dest || !dest.firstChild
      ||
      !dest.firstChild.attributes
      ||
      !dest.firstChild.attributes['data-react-checksum']
    )
  ) {
    console.error('Server-side React render was discarded.');
  }
}

if (module.hot) {
  const isString = string => typeof string === 'string';
  const orgError = console.error;
  console.error = (...args) => {
    if (
      args
      && args.length === 1
      && isString(args[0])
      && args[0].indexOf('You cannot change <Router ') > -1
    ) {
    // React route changed
    } else {
      // Log the error as normally
      orgError.apply(console, args);
    }
  };

  module.hot.accept('../app/routes', () => {
    const nextRoutes = require('../app/routes');
    hydrateApp({
      routes: nextRoutes(store),
      store,
      history
    });
  });
}

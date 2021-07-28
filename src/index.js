import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';
import ReactDOM from 'react-dom';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import './index.scss';
import App from './components/App';
import { initIcons, initServiceWorker, isProduction } from './modules/helpers';

window.bugsnagClient = Bugsnag.start({
  apiKey: `${process.env.BUGSNAG_KEY}`,
  plugins: [new BugsnagPluginReact()],
});

if (isProduction()) {
  LogRocket.init('skxlwh/bigredlink');
  setupLogRocketReact(LogRocket);
  Bugsnag.beforeNotify = (data) => {
    // eslint-disable-next-line no-param-reassign
    data.metaData.sessionURL = LogRocket.sessionURL;
    return data;
  };
}

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const ErrorView = () => {
  const clickHandler = () => {
    window.location.href = '/';
  };

  return (
    <div className="w-full text-center bg-black">
      <h3 className="text-2xl text-red-500">Sorry, an error has occured.</h3>
      <br />
      <br />
      <button onClick={clickHandler} className="p-6 text-lg font-bold leading-loose text-gray-100 bg-red-500" type="button">
        &nbsp;&nbsp;Click Here to Reload and Try Again&nbsp;&nbsp;
      </button>
    </div>
  );
};

initIcons();

const appElement = document.getElementById('root');

ReactDOM.render(
  <ErrorBoundary FallbackComponent={ErrorView}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ErrorBoundary>,
  appElement,
);

initServiceWorker();

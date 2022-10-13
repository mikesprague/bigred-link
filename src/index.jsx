import React, { StrictMode } from 'react';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { App } from './components/App.jsx';

import { initIcons } from './modules/helpers.jsx';

import './index.scss';

window.bugsnagClient = Bugsnag.start({
  apiKey: `${import.meta.env.VITE_BUGSNAG_KEY}`,
  plugins: [new BugsnagPluginReact()],
});

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const ErrorView = () => {
  const clickHandler = () => {
    window.location.href = '/';
  };

  return (
    <div className="w-full text-center bg-black">
      <h3 className="text-2xl text-red-500">Sorry, an error has occurred.</h3>
      <br />
      <br />
      <button
        onClick={clickHandler}
        className="p-6 text-lg font-bold leading-loose text-gray-100 bg-red-500"
        type="button"
      >
        &nbsp;&nbsp;Click Here to Reload and Try Again&nbsp;&nbsp;
      </button>
    </div>
  );
};

initIcons();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ErrorBoundary FallbackComponent={ErrorView}>
    <StrictMode>
      <App />
    </StrictMode>
  </ErrorBoundary>,
);

registerSW({
  onNeedRefresh() {
    window.location.reload(true);
  },
  onOfflineReady() {},
  immediate: true,
});

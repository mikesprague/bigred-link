import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

import { App } from './components/App.jsx';

import './index.css';

// @ts-ignore
window.bugsnagClient = Bugsnag.start({
  apiKey: `${import.meta.env.VITE_BUGSNAG_KEY}`,
  plugins: [new BugsnagPluginReact()],
});

// @ts-ignore
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const ErrorView = () => {
  const clickHandler = () => {
    window.location.href = '/';
  };

  return (
    <div className='w-full text-center bg-black'>
      <h3 className='text-2xl text-red-500'>Sorry, an error has occurred.</h3>
      <br />
      <br />
      <button
        onClick={clickHandler}
        className='p-6 text-lg font-bold leading-loose text-gray-100 bg-red-500'
        type='button'
      >
        &nbsp;&nbsp;Click Here to Reload and Try Again&nbsp;&nbsp;
      </button>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

root.render(
  <ErrorBoundary FallbackComponent={ErrorView}>
    <StrictMode>
      <App />
    </StrictMode>
  </ErrorBoundary>
);

registerSW({
  onNeedRefresh() {
    window.location.reload();
  },
  onOfflineReady() {},
  immediate: true,
});

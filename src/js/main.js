import '../scss/styles.scss';
import axios from 'axios';
import bugsnag from '@bugsnag/js';
import LogRocket from 'logrocket';
import * as helpers from './modules/helpers';

const isProduction = helpers.isProduction();

if (isProduction) {
  helpers.forceHttps();
  LogRocket.init('skxlwh/bigredlink');
  window.bugsnagClient = bugsnag('723fa77654c41aae8632bace87a7939f');
  bugsnag.beforeNotify = (data) => {
    // eslint-disable-next-line no-param-reassign
    data.metaData.sessionURL = LogRocket.sessionURL;
    return data;
  };
}

const form = document.querySelector('.url-form');
const result = document.querySelector('.result-section');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('.url-input');
  await axios.post('/new', {
    link: input.value,
  }).then((response) => {
    while (result.hasChildNodes()) {
      result.removeChild(result.lastChild);
    }
    result.insertAdjacentHTML('afterbegin', `
      <div class="result">
        <a target="_blank" class="result-link" rel="noopener" href="/${response.data.short_id}">
          ${location.origin}/${response.data.short_id}
        </a>
      </div>
    `);
    return response.data;
  }).catch((error) => {
    helpers.handleError(error);
  });
});

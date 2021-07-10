import '../scss/styles.scss';
import axios from 'axios';
import Bugsnag from '@bugsnag/js';
import * as DOMPurify from 'dompurify';
import LogRocket from 'logrocket';
import * as helpers from './modules/helpers';

const isProduction = helpers.isProduction();

if (isProduction) {
  LogRocket.init('skxlwh/bigredlink');
  window.bugsnagClient = Bugsnag.start(`${process.env.BUGSNAG_KEY}`);
  Bugsnag.beforeNotify = (data) => {
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
  const linkToShorten = DOMPurify.sanitize(input.value);
  await axios({
    url: '/api/new-shortlink',
    method: 'POST',
    data: { link: linkToShorten },
    proxy: false,
  })
    .then((response) => {
      const resultTemplate = helpers.getResultMarkup(
        window.location.origin,
        response.data.short_id,
      );
      result.innerHTML = resultTemplate;
      helpers.initCopyToClipboard();
      return response.data;
    })
    .catch((error) => {
      helpers.handleError(error);
    });
});

import '../scss/styles.scss';
import axios from 'axios';
import Bugsnag from '@bugsnag/js';
import * as DOMPurify from 'dompurify';
import LogRocket from 'logrocket';
import * as helpers from './modules/helpers';

const isProduction = helpers.isProduction();

if (isProduction) {
  LogRocket.init('skxlwh/bigredlink');
  window.bugsnagClient = Bugsnag.start('efd0bccb34ee27c231eb01c233af7be6');
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
  await axios.post('/new', {
    link: linkToShorten,
  }).then((response) => {
    const resultTemplate = helpers.getResultMarkup(location.origin, response.data.short_id);
    result.innerHTML = resultTemplate;
    helpers.initCopyToClipboard();
    helpers.initFontAwesomeIcons();
    return response.data;
  }).catch((error) => {
    helpers.handleError(error);
  });
});

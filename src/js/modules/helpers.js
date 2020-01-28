import * as clipboard from 'clipboard-polyfill';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faCopy,
} from '@fortawesome/pro-duotone-svg-icons';

export function isProduction() {
  return window.location.hostname.toLowerCase() === 'bigred.link';
}

export function initFontAwesomeIcons() {
  library.add(
    faCopy,
  );
  dom.watch();
}

export function initCopyToClipboard() {
  const cbLink = document.querySelector('.clipboardLink');
  const linkHref = document.querySelector('.result-link').textContent.trim();
  const resultEl = document.querySelector('.copyResult');
  cbLink.addEventListener('click', (event) => {
    event.preventDefault();
    clipboard.writeText(linkHref);
    clipboard.writeText(linkHref).then(() => {
      resultEl.textContent = 'copied!';
    }, (err) => {
      resultEl.textContent = err;
    });
  });
}

export function handleError(error) {
  if (isProduction()) {
    // eslint-disable-next-line no-undef
    bugsnagClient.notify(error);
  }
  console.error(error);
  throw new Error(error);
}

export function getResultMarkup(urlPrefix, shortId) {
  const resultTemplate = `
    <div class="result">
      <a target="_blank" class="result-link" rel="noopener" href="/${shortId}">
        ${urlPrefix}/${shortId}
      </a>
      <small class="clipboard-text">
        <br><br>
        <a href="#" class="clipboardLink">
          <em><i class="fad fa-copy fa-fw"></i> Click here to copy to clipboard</em>
        </a>&nbsp;<small class="copyResult font-italic"></small>
      </small>
    </div>
  `;
  return resultTemplate;
}

import * as clipboard from 'clipboard-polyfill';

/* eslint-disable no-undef */
export function isProduction() {
  return window.location.hostname.toLowerCase() === 'bigred.link';
}

export function initCopyToClipboard() {
  const cbLink = document.querySelector('.clipboard-link');
  const linkHref = document.querySelector('.result-link').textContent.trim();
  cbLink.addEventListener('click', (event) => {
    event.preventDefault();
    clipboard.writeText(linkHref);
    clipboard.writeText(linkHref).then(
      () => {
        cbLink.textContent = 'Copied!';
        cbLink.setAttribute('style', 'cursor: default');
      },
      (err) => {
        cbLink.textContent = err;
      },
    );
  });
}

export function handleError(error) {
  if (isProduction()) {
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
        <div class="clipboard-link">
          <i class="fad fa-copy fa-fw"></i> Click here to copy to clipboard
        </div>
      </small>
    </div>
  `;
  return resultTemplate;
}

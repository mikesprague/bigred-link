export function isProduction() {
  return window.location.hostname === 'bigred.link';
}

export function forceHttps() {
  if (isProduction()) {
    const secureUrl = window.location.href.replace('http:', 'https:');
    return window.location.replace(secureUrl);
  }
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
  </div>
  `;
  return resultTemplate;
}

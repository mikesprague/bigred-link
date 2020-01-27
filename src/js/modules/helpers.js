export function isProduction() {
  return window.location.hostname.toLowerCase() === 'bigred.link';
}

export function forceHttps() {
  if (isProduction() && window.location.origin !== 'https:') {
    const secureUrl = window.location.href.replace('http:', 'https:');
    console.log(secureUrl);
    window.location.replace(secureUrl);
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
    <small class="clipboard-text d-none">
      <br><br>
      <em>Short URL copied to clipboard</em>
    </small>
  </div>
  `;
  return resultTemplate;
}

export function forceHttps() {
  const { protocol } = window.location;
  if (protocol === 'http:') {
    const secureUrl = window.location.href.replace('http:', 'https:');
    return window.location.replace(secureUrl);
  }
  return true;
}

export function handleError (error, bugsnagClient = null) {
  console.error(error);
  if (bugsnagClient) {
    bugsnagClient.notify(error);
  }
}

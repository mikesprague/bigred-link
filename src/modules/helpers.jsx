import * as clipboard from 'clipboard-polyfill';
import {
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import axios from 'axios';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

const apiKey = import.meta.env.VITE_ABSTRACT_GEO_IP_API_KEY;

export const initIcons = () => {
  library.add(faClipboard, faRotateRight, faTriangleExclamation);
};

export const isProduction = () =>
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

export const getClientGeoIpInfo = async () => {
  const geoIpData = await axios
    .get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`)
    .then((response) => response.data)
    .catch((error) => console.error(error));

  // console.log(geoIpData);

  return geoIpData;
};

export const initCopyToClipboard = () => {
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
};

export const isValidUrl = (url) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const validUrl = new URL(url);
  } catch (error) {
    console.error(error);

    return false;
  }

  return true;
};

export const handleError = (error) => {
  if (isProduction()) {
    // eslint-disable-next-line no-undef
    bugsnagClient.notify(error);
  }

  console.error(error);
  // throw new Error(error);
};

export const getResultMarkup = (urlPrefix, shortId) => (
  <div className="result">
    <a
      target="_blank"
      className="result-link"
      rel="noopener noreferrer"
      href={`${urlPrefix}/${shortId}`}
    >
      {`${urlPrefix}/${shortId}`}
    </a>
    <small className="clipboard-text">
      <br />
      <br />
      <div className="clipboard-link">
        <FontAwesomeIcon icon={['far', 'clipboard']} fixedWidth />
        {` Click here to copy to clipboard`}
      </div>
      <div>
        <br />
        <br />
        <small>
          <a className="start-over-link" href="/">
            <FontAwesomeIcon icon={['fas', 'rotate-right']} fixedWidth />
            {` Start over`}
          </a>
        </small>
      </div>
    </small>
  </div>
);

export const getErrorMarkup = (errorMessage) => (
  <div className="result">
    <FontAwesomeIcon icon={['fas', 'triangle-exclamation']} fixedWidth />
    Error
    <small className="clipboard-text">
      <br />
      <br />
      <div className="clipboard-link">{errorMessage}</div>
    </small>
  </div>
);

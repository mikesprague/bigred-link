import * as clipboard from 'clipboard-polyfill';
import {
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
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
  const geoIpData = await fetch(
    `https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`
  )
    .then((response) => response.json())
    .catch((error) => console.error(error));
  // console.log(geoIpData);

  return geoIpData;
};

export const initCopyToClipboard = () => {
  const cbLink = document.querySelector('.clipboard-link');
  console.log('cbLink:', cbLink);
  const linkHref = String(
    document.querySelector('.result-link').textContent.trim()
  );
  console.log('linkHref:', linkHref);

  cbLink.addEventListener('click', async (event) => {
    event.preventDefault();
    // clipboard.writeText(linkHref);
    clipboard.writeText(linkHref).then(
      () => {
        cbLink.textContent = 'Copied!';
        cbLink.setAttribute('style', 'cursor: default');
      },
      (err) => {
        cbLink.textContent = err;
      }
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
  <div className="result bg-zinc-800/75 border-solid rounded-md my-0 mx-auto text-xl text-center p-5 font-normal max-w-3xl">
    <a
      target="_blank"
      className="result-link text-light-grey text-xl no-underline"
      rel="noopener noreferrer"
      href={`${urlPrefix}/${shortId}`}
    >
      {`${urlPrefix}/${shortId}`}
    </a>
    <small className="clipboard-text">
      <br />
      <br />
      <div className="clipboard-link text-red-500 hover:text-stone-500 cursor-pointer text-decoration-none">
        <FontAwesomeIcon icon={['far', 'clipboard']} fixedWidth />
        {' Click here to copy to clipboard'}
      </div>
      <div>
        <br />
        <br />
        <small>
          <a
            className="start-over-link text-blue-links cursor-pointer text-base no-underline"
            href="/"
          >
            <FontAwesomeIcon icon={['fas', 'rotate-right']} fixedWidth />
            {' Start over'}
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

import { atom, useAtom } from 'jotai';
import DOMPurify from 'dompurify';
import React, { useCallback, useEffect, useRef } from 'react';

import {
  getClientGeoIpInfo,
  getErrorMarkup,
  getResultMarkup,
  handleError,
  initCopyToClipboard,
} from '../modules/helpers.jsx';

export const linkAtom = atom('');
export const resultsAtom = atom('');
export const hasErrorAtom = atom(false);

export const Main = () => {
  const [link, setLink] = useAtom(linkAtom);
  const [results, setResults] = useAtom(resultsAtom);
  const [hasError, setHasError] = useAtom(hasErrorAtom);

  const inputRef = useRef();
  const buttonRef = useRef();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      buttonRef.current.disabled = true;
      inputRef.current.disabled = true;

      const clientData = await getClientGeoIpInfo();

      await fetch('/api/new-shortlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link, clientData }),
      })
        .then(async (response) => {
          const responseJson = await response.json();
          let resultTemplate;
          if (responseJson.errorCode) {
            resultTemplate = getErrorMarkup(responseJson.errorMessage);
          } else {
            resultTemplate = getResultMarkup(
              window.location.origin,
              responseJson.short_id
            );
          }

          setResults(resultTemplate);
          setHasError(false);

          return responseJson;
        })
        .catch((error) => {
          handleError(error);
          setHasError(true);
        });
    },
    [link, setResults, setHasError]
  );

  const handleChange = (event) => {
    const inputVal = DOMPurify.sanitize(event.target.value);

    setLink(inputVal);
  };

  useEffect(() => {
    if (results && !hasError) {
      initCopyToClipboard();
    }
  }, [results, hasError]);

  return (
    <main className="w-screen items-center content-center flex-grow text-center p-4">
      <form className="url-form" onSubmit={handleSubmit}>
        <div className="whitespace-normal sm:whitespace-nowrap flex-wrap sm:flex-nowrap w-full mx-auto">
          <input
            type="url"
            className="text-zinc-800 bg-white border-white mb-0 sm:mb-3 sm:mr-0 text-base sm:text-lg rounded rounded-b-none sm:rounded-l sm:rounded-r-none px-4 py-3 w-full sm:w-4/5 text-center focus:outline-hidden focus:shadow-hidden focus:ring-hidden placeholder:text-lg disabled:cursor-not-allowed"
            placeholder="Type or paste in a URL and shorten it!"
            name="link"
            id="link"
            required
            // biome-ignore lint/a11y/noAutofocus: <explanation>
            autoFocus
            value={link}
            ref={inputRef}
            onChange={handleChange}
          />
          <button
            className="btn-shorten bg-zinc-800 border-solid border-dk-grey text-white hover:text-red-500 text-base sm:text-lg w-full sm:w-auto sm:ml-0 px-4 py-3 rounded rounded-t-none sm:rounded-t sm:rounded-l-none disabled:text-white disabled:cursor-not-allowed"
            type="submit"
            ref={buttonRef}
          >
            Shorten
          </button>
        </div>
      </form>
      <div className="result-section mx-auto">{results}</div>
    </main>
  );
};

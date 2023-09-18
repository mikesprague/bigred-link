import axios from 'axios';
import DOMPurify from 'dompurify';
import React, { useEffect, useRef, useState } from 'react';

import {
  getClientGeoIpInfo,
  getErrorMarkup,
  getResultMarkup,
  handleError,
  initCopyToClipboard,
} from '../modules/helpers.jsx';

export const Main = () => {
  const [link, setLink] = useState('');
  const [results, setResults] = useState('');
  const [hasError, setHasError] = useState(false);

  const inputRef = useRef();
  const buttonRef = useRef();

  const handleSubmit = async (event) => {
    event.preventDefault();

    buttonRef.current.disabled = true;
    inputRef.current.disabled = true;

    const clientData = await getClientGeoIpInfo();

    await axios({
      url: '/api/new-shortlink',
      method: 'POST',
      data: { link, clientData },
    })
      .then((response) => {
        let resultTemplate;

        if (response.data.errorCode) {
          resultTemplate = getErrorMarkup(response.data.errorMessage);
        } else {
          resultTemplate = getResultMarkup(
            window.location.origin,
            response.data.short_id
          );
        }

        setResults(resultTemplate);
        setHasError(true);

        return response.data;
      })
      .catch((error) => {
        handleError(error);
      });
  };

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
    <main>
      <form className="url-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="url"
            className="url-input form-input"
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
          <button className="btn-shorten" type="submit" ref={buttonRef}>
            Shorten
          </button>
        </div>
      </form>
      <div className="result-section">{results}</div>
    </main>
  );
};

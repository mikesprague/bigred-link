/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import axios from 'axios';

import {
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

    await axios({
      url: '/api/new-shortlink',
      method: 'POST',
      data: { link },
    })
      .then((response) => {
        let resultTemplate;

        if (response.data.errorCode) {
          resultTemplate = getErrorMarkup(response.data.errorMessage);
        } else {
          resultTemplate = getResultMarkup(
            window.location.origin,
            response.data.short_id,
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

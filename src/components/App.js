/* eslint-disable jsx-a11y/no-autofocus */
import axios from 'axios';
import React, { useState, useRef } from 'react';
import * as DOMPurify from 'dompurify';
import './App.scss';
import {
  getResultMarkup,
  handleError,
  initCopyToClipboard,
} from '../modules/helpers';

export default function App() {
  const [link, setLink] = useState('');
  const [results, setResults] = useState('');

  const formRef = useRef();
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
      proxy: false,
    })
      .then((response) => {
        const resultTemplate = getResultMarkup(
          window.location.origin,
          response.data.short_id,
        );
        setResults(resultTemplate);
        // resultRef.current.innerHTML = resultTemplate;
        initCopyToClipboard();
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

  return (
    <>
      <div className="container max-w-screen-xl min-h-screen p-8 text-center page-wrapper">
        <h1 className="mb-8 text-4xl font-bold text-center page-title">
          BigRed.link
        </h1>
        <form className="url-form" onSubmit={handleSubmit} ref={formRef}>
          <input
            type="url"
            className="url-input form-input"
            placeholder="Paste in a link to shorten it"
            name="link"
            id="link"
            required
            autoFocus
            value={link}
            ref={inputRef}
            onChange={handleChange}
          />
          <button className="btn-shorten" type="submit" ref={buttonRef}>
            Shorten!
          </button>
        </form>
        <div className="result-section">{results}</div>
      </div>
      <div className="fixed min-w-full text-base text-center bottom-2">
        <p className="mb-1 text-sm text-center">
          Copyright &copy; 2021 BigRed.link. All Rights Reserved
        </p>
        <p className="mb-1 text-sm italic text-center">
          BigRed.link is <strong>NOT</strong> affiliated with or endorsed by
          Cornell University.
        </p>
      </div>
    </>
  );
}

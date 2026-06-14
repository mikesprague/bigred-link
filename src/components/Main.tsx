import DOMPurify from 'dompurify';
import { atom, useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

import {
  getClientGeoIpInfo,
  getErrorMarkup,
  getResultMarkup,
  handleError,
  initCopyToClipboard,
} from '../modules/helpers.js';

export const linkAtom = atom('');
export const resultsAtom = atom('');
export const hasErrorAtom = atom(false);

export const Main = () => {
  const [link, setLink] = useAtom(linkAtom);
  const [results, setResults] = useAtom(resultsAtom);
  const [hasError, setHasError] = useAtom(hasErrorAtom);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (buttonRef.current) {
        buttonRef.current.disabled = true;
      }
      if (inputRef.current) {
        inputRef.current.disabled = true;
      }

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

          setResults(resultTemplate as unknown as string);
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = DOMPurify.sanitize(event.target.value);

    setLink(inputVal);
  };

  useEffect(() => {
    if (results && !hasError) {
      initCopyToClipboard();
    }
  }, [results, hasError]);

  return (
    <main className='w-screen items-center content-center grow text-center p-4'>
      <form className='url-form' onSubmit={handleSubmit}>
        <div className='whitespace-normal sm:whitespace-nowrap flex-wrap sm:flex-nowrap w-full mx-auto px-12 sm:px-4 flex items-center justify-center'>
          <InputGroup className='w-full sm:w-4/5 mx-auto bg-white'>
            <InputGroupInput
              placeholder='Type or paste in a URL and shorten it!'
              value={link}
              ref={inputRef}
              onChange={handleChange}
              name='link'
              id='link'
              className='disabled:cursor-not-allowed placeholder:text-zinc-500 text-zinc-800'
              required
              autoFocus
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                variant='secondary'
                ref={buttonRef}
                type='submit'
                className='btn-shorten hover:text-red-400 disabled:text-white disabled:cursor-not-allowed'
              >
                Shorten
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </form>
      <div className='result-section mx-auto'>{results}</div>
    </main>
  );
};

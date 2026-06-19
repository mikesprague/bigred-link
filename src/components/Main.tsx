import DOMPurify from 'dompurify';
import { atom, useAtom } from 'jotai';
import { useCallback, useRef } from 'react';

import {
  ShortLinkResult,
  ShortLinkError,
} from '@/components/ShortLinkResult.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

import './Main.css';
import { getClientGeoIpInfo, handleError } from '@/lib/helpers.js';

export const linkAtom = atom('');
export const resultAtom = atom<
  | {
      original_url: string;
      short_id: string;
    }
  | undefined
>(undefined);
export const hasErrorAtom = atom(false);
export const errorMessageAtom = atom('');

export const Main = () => {
  const [link, setLink] = useAtom(linkAtom);
  const [result, setResult] = useAtom(resultAtom);
  const [hasError, setHasError] = useAtom(hasErrorAtom);
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getShortLink = async (
    link: string
  ): Promise<{ original_url: string; short_id: string }> => {
    const clientData = await getClientGeoIpInfo();

    const shortLinkResponse = await fetch('/api/new-shortlink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ link, clientData }),
    });

    return shortLinkResponse.json();
  };

  const handleSubmit = useCallback(
    async (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (buttonRef.current) {
        buttonRef.current.disabled = true;
      }
      if (inputRef.current) {
        inputRef.current.disabled = true;
      }

      try {
        const { original_url, short_id } = await getShortLink(link);
        setResult({ original_url, short_id });
      } catch (error) {
        handleError(error as Error);
        setHasError(true);
        setErrorMessage((error as Error).message);
      }
    },
    [link, setResult, setHasError, setErrorMessage]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = DOMPurify.sanitize(event.target.value);

    setLink(inputVal);
  };

  return (
    <main className='w-screen items-center grow text-center p-4'>
      <form className='url-form' onSubmit={handleSubmit}>
        <div className='whitespace-normal sm:whitespace-nowrap flex-wrap sm:flex-nowrap w-full mx-auto px-12 sm:px-4 flex items-center justify-center'>
          <InputGroup className='w-full sm:w-4/5 mx-auto bg-white h-16 text-2xl'>
            <InputGroupInput
              placeholder='Type or paste in a URL and shorten it!'
              value={link}
              ref={inputRef}
              onChange={handleChange}
              name='link'
              id='link'
              className='disabled:cursor-not-allowed placeholder:text-zinc-500 text-zinc-800 text-lg placeholder:text-lg'
              required
              autoFocus
            />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                variant='secondary'
                ref={buttonRef}
                type='submit'
                size='sm'
                className='btn-shorten hover:text-red-400 disabled:text-white disabled:cursor-not-allowed text-xl font-normal'
              >
                Shorten
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </form>
      <div className='result-section mx-auto'>
        {result && !hasError ? (
          <ShortLinkResult shortId={result.short_id} />
        ) : hasError && errorMessage.trim().length > 0 ? (
          <ShortLinkError errorMessage='An error occurred while shortening the URL.' />
        ) : null}
      </div>
    </main>
  );
};

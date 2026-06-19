import { Clipboard, RotateCw, TriangleAlert } from 'lucide-react';

import { useClipboard } from '@/hooks/useClipboard.ts';

export interface ShortLinkResultProps {
  urlPrefix?: string;
  shortId: string;
}

export const ShortLinkResult = ({
  shortId,
  urlPrefix = 'https://bigred.link',
}: ShortLinkResultProps) => {
  const { copy, copied, error: copyError } = useClipboard();

  const shortLink = `${urlPrefix}/${shortId}`;

  const handleCopy = async () => {
    await copy(shortLink);
  };

  return (
    <div className='result bg-zinc-800/75 border-solid rounded-md my-0 mx-auto text-xl text-center p-5 font-normal max-w-3xl'>
      <a
        target='_blank'
        className='result-link text-light-grey text-xl no-underline'
        rel='noopener noreferrer'
        href={shortLink}
      >
        {shortLink}
      </a>
      <small className='clipboard-text'>
        <br />
        <br />
        <a
          className='clipboard-link text-red-500 hover:text-stone-500 cursor-pointer text-decoration-none inline-flex items-center justify-center gap-2'
          onClick={handleCopy}
        >
          <Clipboard />
          {copyError
            ? ' Copy Error!'
            : copied
              ? ' Copied!'
              : ' Click here to copy to clipboard'}
        </a>
        <div>
          <br />
          <br />
          <small>
            <a
              className='start-over-link text-blue-links cursor-pointer text-base no-underline inline-flex items-center justify-center gap-2'
              href='/'
            >
              <RotateCw />
              {' Start over'}
            </a>
          </small>
        </div>
      </small>
    </div>
  );
};

export const ShortLinkError = ({ errorMessage }: { errorMessage: string }) => (
  <div className='result bg-red-800/75 border-solid rounded-md my-0 mx-auto text-xl text-center p-5 font-normal max-w-3xl text-red-500'>
    <TriangleAlert />
    Error
    <small className='clipboard-text'>
      <br />
      <br />
      <div className='clipboard-link'>{errorMessage}</div>
    </small>
  </div>
);

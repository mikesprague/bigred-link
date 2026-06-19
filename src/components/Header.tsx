import { version } from '../../package.json';

import './Header.css';

export const Header = () => (
  <header className='w-screen'>
    <h1
      className='page-title mb-12 my-6 text-5xl font-bold text-center cursor-default'
      title={`BigRed.link v${version}`}
    >
      BigRed.link<span className='version-string hidden'> v{version}</span>
    </h1>
  </header>
);

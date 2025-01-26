import React from 'react';
import { version } from '../../package.json';

import './Header.css';

export const Header = () => (
  <header className="w-screen">
    <h1
      className="page-title mb-12 my-6 text-5xl font-bold text-center"
      title={`BigRed.link v${version}`}
    >
      BigRed.link
    </h1>
  </header>
);

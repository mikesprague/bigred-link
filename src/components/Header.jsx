import React from 'react';
import { version } from '../../package.json';

import './Header.scss';

export const Header = () => (
  <header>
    <h1 className="page-title" title={`BigRed.link v${version}`}>
      BigRed.link
    </h1>
  </header>
);

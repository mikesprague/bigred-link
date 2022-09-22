import React from 'react';

import './Footer.scss';

export const Footer = () => (
  <footer>
    <p className="copyright-text">
      Copyright &copy; {new Date().getFullYear()} BigRed.link. All Rights
      Reserved
    </p>
    <p className="no-affiliation-text">
      BigRed.link is <strong>NOT</strong> affiliated with or endorsed by Cornell
      University.
    </p>
  </footer>
);

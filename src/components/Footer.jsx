import React from 'react';

export const Footer = () => (
  <footer className="w-screen">
    <p className="copyright-text mb-1 text-xs text-center">
      Copyright &copy; {new Date().getFullYear()} BigRed.link. All Rights
      Reserved
    </p>
    <p className="no-affiliation-text mb-1 text-base italic text-center">
      BigRed.link is <strong>NOT</strong> affiliated with or endorsed by Cornell
      University.
    </p>
  </footer>
);

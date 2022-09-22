import React from 'react';

import './App.scss';

import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { Main } from './Main.jsx';
import { PageWrapper } from './PageWrapper';

export const App = () => (
  <PageWrapper>
    <Header />
    <Main />
    <Footer />
  </PageWrapper>
);

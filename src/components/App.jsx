import React from 'react';

import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { Main } from './Main.jsx';
import { PageWrapper } from './PageWrapper.jsx';

export const App = () => (
  <PageWrapper>
    <Header />
    <Main />
    <Footer />
  </PageWrapper>
);

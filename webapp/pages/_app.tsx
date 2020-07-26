import React from 'react';
import './_app.css';

// eslint-disable-next-line
export default function MyApp({ Component, pageProps }: any): JSX.Element {
  return <Component {...pageProps} />;
}

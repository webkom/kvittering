import React from 'react';
import Head from 'next/head';
import './_app.css';

// eslint-disable-next-line
function MyApp({ Component, pageProps }: any): JSX.Element {
  return (
    <>
      <Head>
        <title> Kvittering </title>
      </Head>
      <Component {...pageProps} />;
    </>
  );
}

export default MyApp;

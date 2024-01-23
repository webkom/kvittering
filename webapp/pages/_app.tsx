import { NextUIProvider } from '@nextui-org/react';
import Head from 'next/head';
import './_app.css';

// eslint-disable-next-line
export default function MyApp({ Component, pageProps }: any): JSX.Element {
  return (
    <>
      <Head>
        <title>Kvittering | Abakus.no</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <NextUIProvider>
        <Component {...pageProps} />;
      </NextUIProvider>
    </>
  );
}

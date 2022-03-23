import React from 'react';
import Image from 'next/image';
import { CssBaseline, Container } from '@mui/material';

import Form from 'components/Form';
import Footer from 'components/Footer';

const App = (): JSX.Element => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'space-between',
    }}
  >
    <CssBaseline />
    <Container maxWidth="sm" fixed>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Image
          src="/abakus.png"
          alt="abakus logo"
          width="380px"
          height="80px"
        />
      </div>
      <Form />
    </Container>
    <Footer />
  </div>
);

export default App;

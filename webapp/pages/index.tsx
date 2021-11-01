import React from 'react';
import { CssBaseline, Container } from '@material-ui/core';

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
      <img
        src="/itdagene.png"
        alt="itDAGENE logo"
        width="100%"
        style={{ padding: '50px' }}
      />
      <Form />
    </Container>
    <Footer />
  </div>
);

export default App;

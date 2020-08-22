import React from 'react';
import { CssBaseline, Container } from '@material-ui/core';

import Form from 'components/Form';

const App = (): JSX.Element => (
  <React.Fragment>
    <CssBaseline />
    <Container maxWidth="sm" fixed>
      <img
        src="/abakus.png"
        alt="abakus logo"
        width="100%"
        style={{ padding: '50px' }}
      />
      <Form />
    </Container>
  </React.Fragment>
);

export default App;

import React from 'react';
import { CssBaseline, Container } from '@material-ui/core';

import Form from 'components/Form';

const App = (): JSX.Element => (
  <React.Fragment>
    <CssBaseline />
    <Container maxWidth="sm" fixed>
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}
      >
        <img src="/abakus.png" alt="abakus logo" width="250px" />
      </div>
      <Form />
    </Container>
  </React.Fragment>
);

export default App;

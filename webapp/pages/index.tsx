import { Container } from '@nextui-org/react';

import Form from 'components/Form';
import Footer from 'components/Footer';

const App = (): JSX.Element => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
    }}
  >
    {/* <Container responsive xs style={{ maxWidth: '600px' }}> */}
    <Form />
    {/* </Container> */}
    <Footer />
  </div>
);

export default App;

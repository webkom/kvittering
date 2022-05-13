import { Container, Card, Row, Text } from '@nextui-org/react';

import Form from 'components/Form';
import Footer from 'components/Footer';

const App = (): JSX.Element => (
  <>
    <Container fluid xs>
      <Card>
        <Row justify="center" align="center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" style={{ width: '50px' }} />
          <Text h1>Kvitteringsskjema</Text>
        </Row>
        <Form />
      </Card>
    </Container>
    <Footer />
  </>
);

export default App;

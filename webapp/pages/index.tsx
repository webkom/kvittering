import { Card, Container, Divider, Row, Spacer, Text } from '@nextui-org/react';

import Form from 'components/Form';
import Footer from 'components/Footer';

const App = (): JSX.Element => (
  <Container xs>
    <Card>
      <Card.Header>
        <Row justify="center" align="center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" style={{ width: '50px' }} />
          <Spacer x={0.4} />
          <Text h4>Kvitteringsskjema</Text>
        </Row>
      </Card.Header>
      <Divider />
      <Card.Body>
        <Form />
      </Card.Body>
    </Card>
    <Footer />
  </Container>
);

export default App;

import { Card, CardBody, CardHeader, Divider, Spacer } from '@nextui-org/react';

// import Form from 'components/Form';
import Footer from 'components/Footer';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const DynamicForm = dynamic(() => import('../components/Form'), { ssr: false });

const App = (): JSX.Element => (
  <div className="max-w-xl mx-auto mt-5">
    <Card>
      <CardHeader>
        <div className={'flex justify-center items-center w-full'}>
          <Image
            src="/favicon.png"
            alt={'Abakus-logo'}
            width={50}
            height={50}
          />
          <Spacer x={2} />
          <h4>Kvitteringsskjema</h4>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <DynamicForm />
      </CardBody>
    </Card>
    <Footer />
  </div>
);

export default App;

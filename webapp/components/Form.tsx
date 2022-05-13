import { useState } from 'react';
import { Button, Loading, Text, Row, Container, Grid } from '@nextui-org/react';
import { BiReceipt } from 'react-icons/bi';
import Alert from '@mui/lab/Alert';
import { Form } from 'react-final-form';

import ReceiptInput from './Input';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';

import styles from './Form.module.css';

const today = new Date().toISOString().split('T')[0].toString();

const Response = ({
  response,
  success,
  submitting,
}: {
  response: string | null;
  success: boolean | null;
  submitting: boolean;
}): JSX.Element => (
  <div className={styles.response}>
    {/* We have submitted the request, but gotten no response */}
    {submitting && <Loading />}
    {/* We have submitted the request, and gotten succes back */}
    {success === true && <Alert severity="success">{response}</Alert>}
    {/* We have submitted the request, and gotten failure back */}
    {success === false && <Alert severity="error">{response}</Alert>}
  </div>
);

const ReceiptForm = (): JSX.Element => {
  // Hooks for submittion
  const [success, setSuccess] = useState<boolean | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const [images, setImages] = useState<Array<string>>([]);
  const [signature, setSignature] = useState('');

  const onSubmit = async (values: any) => {
    console.log('SUBMIT', values);

    // Reset server response
    setResponse(null);
    setSuccess(null);

    // POST full body to the backend
    fetch(`${process.env.API_URL || ''}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (!res.ok) {
          setSuccess(false);
        } else {
          setSuccess(true);
        }
        return res.text();
      })
      .then((text) => {
        setResponse(text);
      })
      .catch((err) => {
        setResponse(`Error: ${err.text()}`);
      });
  };

  return (
    <>
      <Form
        onSubmit={onSubmit}
        // TODO: Implement SessionStorage
        // initialValues={{ stooge: 'larry', employed: false }}
        render={({ handleSubmit, form, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit}>
            <Grid.Container gap={2.5} justify="center" css={{ mt: '4px' }}>
              <ReceiptInput
                id="name"
                name="Navn"
                required
                helperText="Ditt fulle navn, slik kvitteringen viser"
              />
              <ReceiptInput
                id="mailFrom"
                name="Din epost"
                required
                helperText="Din kopi av skjema går hit"
              />
              <ReceiptInput
                id="committee"
                name="Komité"
                helperText={'Den komitén som skylder deg penger'}
              />
              <ReceiptInput
                id="mailTo"
                name="Økans epost"
                required
                helperText="Økans til komitén/gruppen"
              />
              <ReceiptInput
                id="accountNumber"
                name="Kontonummer"
                required
                type="number"
                helperText="Pengene overføres til dette nummeret"
              />
              <ReceiptInput
                id="amount"
                name="Beløp"
                required
                type="number"
                helperText="Beløpet du ønsker refundert"
              />
              <ReceiptInput
                id="date"
                name="Kjøpsdato"
                required
                type="date"
                helperText="Helst samme som på kvittering"
              />
              <ReceiptInput
                id="occasion"
                name="Anledning"
                helperText="I hvilken anledning har du lagt ut"
              />
              <ReceiptInput
                id="comment"
                name="Kommentar"
                multiLine
                helperText="Fyll inn ekstra informasjon hvis nødvendig"
              />
              <SignatureUpload
                updateForm={setSignature}
                setSignature={setSignature}
              />
              <PictureUpload updateForm={setImages} />
              <Button
                ghost
                disabled={submitting || success === true}
                className={styles.submit}
              >
                <BiReceipt size={25} />
                Generer kvittering
              </Button>
            </Grid.Container>
            <Response
              response={response}
              success={success}
              submitting={submitting}
            />
          </form>
        )}
      />
    </>
  );
};

export default ReceiptForm;

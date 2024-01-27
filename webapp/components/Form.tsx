import { useMemo, useState } from 'react';
import { Button, Loading, Row, Text } from '@nextui-org/react';
import type { FormRenderProps } from 'react-final-form';
import { BiReceipt } from 'react-icons/bi';
import Alert from '@mui/lab/Alert';
import { Form } from 'react-final-form';

import ReceiptInput from './Input';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';

import styles from './Form.module.css';
import { accountValidator, emailValidator } from 'utils/validators';
import { mailToDataList } from 'utils/datalists';

type FormValues = {
  name: string;
  mailFrom: string;
  committee: string;
  mailTo: string;
  accountNumber: string;
  amount?: number;
  date: string;
  occasion: string;
  comment: string;
  signature: string;
  images: string[];
};

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

    {/* We have submitted the request, and gotten success back */}
    {success === true && <Alert severity="success">{response}</Alert>}

    {/* We have submitted the request, and gotten failure back */}
    {success === false && <Alert severity="error">{response}</Alert>}
  </div>
);

const ReceiptForm = (): JSX.Element => {
  // Hooks for submission
  const [success, setSuccess] = useState<boolean | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const onSubmit = async (
    values: FormValues,
    form: FormRenderProps<FormValues, Partial<FormValues>>['form']
  ) => {
    // Reset server response
    setResponse(null);
    setSuccess(null);

    // POST full body to the backend
    await fetch(`${process.env.API_URL || ''}/generate`, {
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
        form.restart();
        setResponse(text);
      })
      .catch((err) => {
        setResponse(`Error: ${err.text()}`);
      });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      // TODO: Implement SessionStorage
      initialValues={{
        name: '',
        mailFrom: '',
        committee: '',
        mailTo: '',
        accountNumber: undefined,
        amount: undefined,
        date: today,
        occasion: '',
        comment: '',
        signature: '',
        images: [],
      }}
      validate={(values) => {
        const errors: { [key: string]: string } = {};
        if (values.signature === '') {
          errors.signature = 'Du må laste opp eller tegne en signatur';
        }
        if (values.images.length === 0) {
          errors.images = 'Du må laste opp minst ett vedlegg';
        }
        return errors;
      }}
      render={({
        form,
        values,
        touched,
        errors,
        hasValidationErrors,
        handleSubmit,
        submitting,
      }) => {
        const hasBeenTouched = useMemo(
          () => Object.values(touched ?? {}).some((touch) => !!touch),
          [touched]
        );

        return (
          <form onSubmit={handleSubmit}>
            <>
              <Row className={styles.row}>
                <ReceiptInput
                  name="name"
                  label="Navn"
                  required
                  helperText="Ditt fulle navn, slik kvitteringen viser"
                  autoFocus
                />

                <ReceiptInput
                  name="mailFrom"
                  label="Din epost"
                  required
                  helperText="Et kopi av skjemaet vil bli sendt hit"
                  validators={[emailValidator]}
                />
              </Row>

              <Row className={styles.row}>
                <ReceiptInput
                  name="committee"
                  label="Komité/gruppe"
                  required
                  helperText={'Den komiteen/gruppa som skylder deg penger'}
                />

                <ReceiptInput
                  name="mailTo"
                  label="Økans epost"
                  required
                  helperText="Økans til komiteen/gruppen"
                  validators={[emailValidator]}
                  suggestions={mailToDataList}
                />
              </Row>

              <Row className={styles.row}>
                <ReceiptInput
                  name="accountNumber"
                  label="Kontonummer"
                  required
                  type="text"
                  helperText="Pengene overføres til dette nummeret"
                  validators={[accountValidator]}
                />

                <ReceiptInput
                  name="amount"
                  label="Beløp"
                  required
                  type="number"
                  helperText="Beløpet du ønsker refundert"
                />
              </Row>

              <Row className={styles.row}>
                <ReceiptInput
                  name="date"
                  label="Kjøpsdato"
                  required
                  type="date"
                  helperText="Helst samme som på kvittering"
                />

                <ReceiptInput
                  name="occasion"
                  label="Anledning"
                  helperText="I hvilken anledning du har lagt ut"
                />
              </Row>

              <Row css={{ marginBottom: '2.5rem' }}>
                <ReceiptInput
                  name="comment"
                  label="Kommentar"
                  multiLine
                  helperText="Fyll inn ekstra informasjon hvis nødvendig"
                  fullWidth
                />
              </Row>

              <SignatureUpload
                signature={values.signature}
                updateForm={(value) => form.change('signature', value)}
                setSignature={(value) => form.change('signature', value)}
              />
              {hasBeenTouched && errors?.signature && (
                <Text color="error" css={{ marginBottom: '1rem' }}>
                  {errors?.signature}
                </Text>
              )}

              <PictureUpload
                images={values.images}
                setImages={(images) => form.change('images', images)}
              />
              {hasBeenTouched && errors?.images && (
                <Text color="error" css={{ marginBottom: '1.5rem' }}>
                  {errors?.images}
                </Text>
              )}

              <Button
                type="submit"
                ghost
                disabled={submitting || hasValidationErrors}
                className={styles.submit}
              >
                <BiReceipt size={25} />
                <Text>Generer kvittering</Text>
              </Button>

              {hasBeenTouched && hasValidationErrors && (
                <Text color="error" css={{ marginTop: '0.3rem' }}>
                  Gå gjennom skjemaet og pass på at du har fylt ut alt du må
                </Text>
              )}

              <Response
                response={response}
                success={success}
                submitting={submitting}
              />
            </>
          </form>
        );
      }}
    />
  );
};

export default ReceiptForm;

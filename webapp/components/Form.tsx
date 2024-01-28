import { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CircularProgress,
  Spacer,
  Tab,
  Tabs,
} from '@nextui-org/react';
import type { FormRenderProps } from 'react-final-form';
import { BiReceipt } from 'react-icons/bi';
import { Form } from 'react-final-form';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';
import { accountValidator, emailValidator } from 'utils/validators';
import { mailToDataList } from 'utils/datalists';
import { FormButton, FormInput } from './elements';
import FormSelect from './elements/FormSelect';

type FormValues = {
  name: string;
  mailFrom: string;
  group: string;
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

const initialValues: FormValues = {
  name: '',
  mailFrom: '',
  group: '',
  mailTo: '',
  accountNumber: '',
  amount: undefined,
  date: today,
  occasion: '',
  comment: '',
  signature: '',
  images: [],
};

const Response = ({
  response,
  success,
  submitting,
}: {
  response: string | null;
  success: boolean | null;
  submitting: boolean;
}): JSX.Element => (
  <div className={'flex justify-center w-full max-h-52'}>
    {/* We have submitted the request, but gotten no response */}
    {submitting && <CircularProgress />}

    {/* We have submitted the request, and gotten success back */}
    {success === true && (
      <Card className={'bg-success mt-3'}>
        <CardBody className={'p-4'}>{response}</CardBody>
      </Card>
    )}

    {/* We have submitted the request, and gotten failure back */}
    {success === false && (
      <Card className={'bg-danger mt-3'}>
        <CardBody className={'p-4'}>{response}</CardBody>
      </Card>
    )}
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
      initialValues={initialValues}
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
      mutators={{
        setGroup: ([groupName], state, utils) => {
          utils.changeValue(state, 'group', () => groupName);
        },
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
            <div
              className={'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 my-2'}
            >
              <FormInput
                name="name"
                label="Navn"
                required
                helperText="Ditt fulle navn, slik kvitteringen viser"
                autoFocus
              />

              <FormInput
                name="mailFrom"
                label="Din e-post"
                required
                helperText="En kopi av skjemaet vil bli sendt hit"
                validators={[emailValidator]}
              />

              <div className={'sm:col-span-2'}>
                <Tabs size="sm" fullWidth>
                  <Tab title={'Velg gruppe'} className={'px-0'}>
                    <FormSelect
                      name={'mailTo'}
                      label={'Gruppe/komité'}
                      required
                      helperText={'Den komiteen/gruppa som skylder deg penger'}
                      onChange={(event) =>
                        form.mutators.setGroup(
                          mailToDataList.find(
                            (mail) => mail.value === event.target.value
                          )?.text
                        )
                      }
                      items={mailToDataList}
                    />
                  </Tab>
                  <Tab
                    title={'Fyll inn gruppe og e-post selv'}
                    className={'px-0'}
                  >
                    <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
                      <FormInput
                        name="group"
                        label="Gruppe/komité"
                        required
                        helperText={
                          'Den komiteen/gruppa som skylder deg penger'
                        }
                      />
                      <FormInput
                        name="mailTo"
                        label="Økans e-post"
                        required
                        helperText="Økans til gruppen/komiteen"
                        validators={[emailValidator]}
                        suggestions={mailToDataList}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </div>

              <FormInput
                name="accountNumber"
                label="Ditt kontonummer"
                required
                type="text"
                helperText="Pengene overføres til dette nummeret"
                validators={[accountValidator]}
              />

              <FormInput
                name="amount"
                label="Beløp"
                required
                type="number"
                helperText="Beløpet du ønsker refundert"
              />

              <FormInput
                name="date"
                label="Kjøpsdato"
                required
                type="date"
                helperText="Helst samme som på kvittering"
              />

              <FormInput
                name="occasion"
                label="Anledning"
                helperText="I hvilken anledning du har lagt ut"
              />

              <FormInput
                name="comment"
                label="Kommentar"
                multiLine
                helperText="Fyll inn ekstra informasjon hvis nødvendig"
                fullWidth
              />
            </div>

            <Spacer y={6} />

            <SignatureUpload
              signature={values.signature}
              updateForm={(value) => form.change('signature', value)}
              setSignature={(value) => form.change('signature', value)}
            />
            {hasBeenTouched && errors?.signature && (
              <p className={'text-danger mt-2 mb-4 text-sm'}>
                {errors?.signature}
              </p>
            )}

            <Spacer y={4} />

            <PictureUpload
              images={values.images}
              setImages={(images) => form.change('images', images)}
            />
            {hasBeenTouched && errors?.images && (
              <p className={'text-danger mt-2 mb-4 text-sm'}>
                {errors?.images}
              </p>
            )}

            <Spacer y={4} />

            <FormButton
              type="submit"
              disabled={submitting || hasValidationErrors}
              startContent={<BiReceipt size={24} />}
            >
              Generer kvittering
            </FormButton>

            {hasBeenTouched && hasValidationErrors && (
              <p className={'text-danger mt-3 text-sm'}>
                Gå gjennom skjemaet og pass på at du har fylt ut alt du må
              </p>
            )}

            <Response
              response={response}
              success={success}
              submitting={submitting}
            />
          </form>
        );
      }}
    />
  );
};

export default ReceiptForm;

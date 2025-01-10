'use client';

import {
  Card,
  CardBody,
  CircularProgress,
  Spacer,
  Tab,
  Tabs,
} from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';
import type { FormRenderProps } from 'react-final-form';
import { Form } from 'react-final-form';
import { BiBlock, BiReceipt } from 'react-icons/bi';
import { mailToDataList } from 'utils/datalists';
import {
  accountValidator,
  emailValidator,
  fullNameValidator,
} from 'utils/validators';
import { FormButton, FormInput } from './elements';
import FormSelect from './elements/FormSelect';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';

type FormValues = {
  name: string;
  mailFrom: string;
  group: string;
  mailTo: string;
  accountNumber: string;
  amount: number | '';
  date: string;
  occasion: string;
  comment: string;
  signature: string;
  images: string[];
};

const storePermanently: (keyof FormValues)[] = ['name', 'mailFrom'];
const storeTemporarily: (keyof FormValues)[] = [
  'group',
  'mailTo',
  'accountNumber',
  'amount',
  'date',
  'occasion',
  'comment',
  'signature',
  'images',
];

const today = new Date().toISOString().split('T')[0].toString();

const localStorage =
  typeof window !== 'undefined' ? window.localStorage : undefined;
const getFromLocalStorage = (key: keyof FormValues) => {
  try {
    return JSON.parse(localStorage?.getItem('formValues.' + key) ?? '""');
  } catch (e) {
    return '';
  }
};
const sessionStorage =
  typeof window !== 'undefined' ? window.sessionStorage : undefined;
const getFromSessionStorage = (
  key: keyof FormValues,
  fallbackJsonString = '""'
) => {
  try {
    return JSON.parse(
      sessionStorage?.getItem('formValues.' + key) ?? fallbackJsonString
    );
  } catch (e) {
    return '';
  }
};

const getInitialValues: () => FormValues = () => ({
  name: getFromLocalStorage('name'),
  mailFrom: getFromLocalStorage('mailFrom'),
  group: getFromSessionStorage('group'),
  mailTo: getFromSessionStorage('mailTo'),
  accountNumber: getFromSessionStorage('accountNumber'),
  amount: isNaN(parseInt(getFromSessionStorage('amount'), 10))
    ? ''
    : parseInt(getFromSessionStorage('amount') ?? '', 10),
  date: getFromSessionStorage('date') || today,
  occasion: getFromSessionStorage('occasion'),
  comment: getFromSessionStorage('comment'),
  signature: getFromSessionStorage('signature'),
  images: getFromSessionStorage('images', '[]'),
});

const Response = ({
  response,
  success,
  submitting,
}: {
  response: string | null;
  success: boolean | null;
  submitting: boolean;
}): JSX.Element => (
  <div className={'flex justify-center w-full max-h-52 mt-3'}>
    {/* We have submitted the request, but gotten no response */}
    {submitting && <CircularProgress />}

    {/* We have submitted the request, and gotten success back */}
    {success === true && (
      <Card className={'bg-success'}>
        <CardBody className={'p-4'}>{response}</CardBody>
      </Card>
    )}

    {/* We have submitted the request, and gotten failure back */}
    {success === false && (
      <Card className={'bg-danger'}>
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
      initialValues={getInitialValues()}
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

        useEffect(() => {
          const timer = setTimeout(() => {
            storePermanently.forEach((valueKey) =>
              localStorage?.setItem(
                'formValues.' + valueKey,
                JSON.stringify(values[valueKey])
              )
            );
            storeTemporarily.forEach((valueKey) =>
              sessionStorage?.setItem(
                'formValues.' + valueKey,
                JSON.stringify(values[valueKey])
              )
            );
          }, 1000);
          return () => clearTimeout(timer);
        }, [values]);

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
                validators={[fullNameValidator]}
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
                helperText="Pengene overføres til dette kontonummeret"
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

            <div className="flex flex-col sm:flex-row gap-4">
              <FormButton
                color="danger"
                startContent={<BiBlock size={24} />}
                disabled={values === getInitialValues()}
                onPress={() => {
                  // Clear locally stored variables and reset the form
                  form.restart();
                  sessionStorage?.clear();
                  localStorage?.clear();
                  const initialValues = getInitialValues();
                  form.batch(() => {
                    Object.keys(initialValues).forEach((valueKey) =>
                      form.change(
                        valueKey as keyof FormValues,
                        initialValues[valueKey as keyof FormValues]
                      )
                    );
                  });
                }}
              >
                Tilbakestill skjemaet
              </FormButton>
              <FormButton
                type="submit"
                color={
                  submitting || hasValidationErrors ? 'default' : 'success'
                }
                className={
                  submitting || hasValidationErrors
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }
                disabled={submitting || hasValidationErrors}
                startContent={<BiReceipt size={24} />}
                onPress={() =>
                  hasValidationErrors &&
                  Object.keys(errors ?? {}).forEach((fieldName) =>
                    form.blur(fieldName as keyof FormValues)
                  )
                }
              >
                Generer og send kvittering
              </FormButton>
            </div>

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

export type FieldValidator = (value?: string) => string | undefined;

export const validateField =
  (validators: (FieldValidator | undefined)[]) => (value?: string) => {
    const responses = validators
      .map((validator) =>
        validator === undefined ? undefined : validator(value)
      )
      .filter((response) => response !== undefined);
    return responses.length === 0 ? undefined : responses[0];
  };

export const requiredValidator: FieldValidator = (value?: string) =>
  value ? undefined : 'Dette feltet er obligatorisk';

export const emailValidator: FieldValidator = (value?: string) => {
  if (!value?.includes('@')) {
    return 'E-post må inneholde @';
  }
  if (!value?.includes('.')) {
    return 'E-post må inneholde punktum';
  }
  if (value?.includes('abakus.com')) {
    return 'Bruh.. det er abakus.no';
  }
};

export const accountValidator: FieldValidator = (value?: string) => {
  if (!Number.isInteger(Number(value?.replaceAll(' ', '')))) {
    return 'Kontonummeret kan kun inneholde tall';
  }
  if (String(value ?? '').replaceAll(' ', '').length !== 11) {
    return 'Kontonummeret må bestå av 11 siffer';
  }
};

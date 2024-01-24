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

  // Modulo-based validation as per https://no.wikipedia.org/wiki/MOD11
  // The last 1 is added to add the control-digit, and the sum should be divisible by 11
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  value
    ?.replaceAll(' ', '')
    .split('')
    .forEach((digit, index) => (sum += Number(digit) * weights[index]));
  if (sum % 11 !== 0) {
    return 'Kontonummeret er ugyldig';
  }
};

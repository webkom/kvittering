import { Field } from 'react-final-form';
import type { FieldRenderProps } from 'react-final-form';
import { Input, Textarea } from '@nextui-org/react';
import styles from './Input.module.css';
import {
  FieldValidator,
  requiredValidator,
  validateField,
} from 'utils/validators';
import { DataListItem } from 'utils/datalists';

type Props = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  helperText?: string;
  fullWidth?: boolean;
  clearable?: boolean;
  contentRight?: JSX.Element;
  multiLine?: boolean;
  autoFocus?: boolean;
  validators?: FieldValidator[];
  suggestions?: DataListItem[];
};

const ReceiptInput = ({
  name,
  label,
  required,
  type,
  helperText,
  clearable,
  contentRight,
  multiLine,
  fullWidth,
  autoFocus,
  validators = [],
  suggestions = [],
}: Props): JSX.Element => (
  <Field
    name={name}
    validate={validateField([
      required ? requiredValidator : undefined,
      ...validators,
    ])}
  >
    {(
      props: FieldRenderProps<
        string | undefined,
        HTMLElement,
        string | undefined
      >
    ) =>
      multiLine ? (
        <Textarea
          id={name}
          label={label}
          name={name}
          value={props.input.value}
          onChange={props.input.onChange}
          onBlur={props.input.onBlur}
          status={props.meta.error}
          required={required}
          helperText={helperText}
          minRows={2}
          fullWidth={fullWidth}
          autoFocus={autoFocus}
        />
      ) : (
        <>
          <Input
            id={name}
            label={label}
            labelPlaceholder={label}
            labelRight={required && '*'}
            name={name}
            value={props.input.value}
            onChange={props.input.onChange}
            onBlur={props.input.onBlur}
            status={
              props.meta.touched && props.meta.error ? 'error' : 'default'
            }
            required={required}
            type={type}
            helperText={
              props.meta.touched && props.meta.error
                ? props.meta.error
                : helperText
            }
            contentRight={contentRight}
            clearable={clearable}
            fullWidth={fullWidth}
            className={styles.input}
            autoFocus={autoFocus}
            list={name + 'list'}
          />
          {suggestions && (
            <datalist id={name + 'list'}>
              {suggestions.map(({ value, text }) => (
                <option value={value} key={value}>
                  {text}
                </option>
              ))}
            </datalist>
          )}
        </>
      )
    }
  </Field>
);

export default ReceiptInput;

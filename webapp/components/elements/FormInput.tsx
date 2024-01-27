import { Field, FieldRenderProps } from 'react-final-form';
import { Input, InputProps, Textarea, TextAreaProps } from '@nextui-org/react';
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
  multiLine?: boolean;
  autoFocus?: boolean;
  validators?: FieldValidator[];
  suggestions?: DataListItem[];
};

const ReceiptInput: React.FC<Props> = ({
  name,
  label,
  required,
  type,
  helperText,
  fullWidth,
  multiLine,
  autoFocus,
  validators = [],
  suggestions = [],
}) => (
  <Field<string, HTMLInputElement | HTMLTextAreaElement>
    name={name}
    validate={validateField([
      required ? requiredValidator : undefined,
      ...validators,
    ])}
  >
    {(
      props: FieldRenderProps<
        string,
        HTMLInputElement | HTMLTextAreaElement,
        string
      >
    ) => {
      const sharedProps: TextAreaProps & InputProps = {
        id: name,
        name,
        value: props.input.value,
        autoFocus,
        className: fullWidth ? 'sm:col-span-2' : '',
        color: props.meta.touched && props.meta.error ? 'danger' : 'default',
        description:
          props.meta.touched && props.meta.error
            ? props.meta.error
            : helperText,
        fullWidth,
        label,
        onChange: props.input.onChange,
        isRequired: required,
      };

      return multiLine ? (
        <Textarea
          onBlur={(event) =>
            props.input.onBlur(
              event as React.FocusEvent<HTMLTextAreaElement, Element>
            )
          }
          minRows={2}
          {...sharedProps}
        />
      ) : (
        <>
          <Input
            onBlur={(event) =>
              props.input.onBlur(
                event as React.FocusEvent<HTMLInputElement, Element>
              )
            }
            type={type}
            list={name + 'list'}
            {...sharedProps}
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
      );
    }}
  </Field>
);

export default ReceiptInput;

import { Field, FieldRenderProps } from 'react-final-form';
import { Select, SelectItem } from '@nextui-org/react';
import {
  FieldValidator,
  requiredValidator,
  validateField,
} from 'utils/validators';
import { DataListItem } from 'utils/datalists';
import { ChangeEvent } from 'react';

type Props = {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  validators?: FieldValidator[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  items?: DataListItem[];
};

const FormSelect: React.FC<Props> = ({
  name,
  label,
  required,
  helperText,
  validators = [],
  onChange,
  items = [],
}) => (
  <Field<string, HTMLSelectElement>
    name={name}
    validate={validateField([
      required ? requiredValidator : undefined,
      ...validators,
    ])}
  >
    {({ input, meta }: FieldRenderProps<string, HTMLSelectElement>) => (
      <Select
        color={meta.touched && meta.error ? 'danger' : 'default'}
        description={meta.touched && meta.error ? meta.error : helperText}
        isRequired={required}
        id={name}
        items={items}
        label={label}
        name={name}
        onBlur={(event) =>
          input.onBlur(event as React.FocusEvent<HTMLSelectElement, Element>)
        }
        onChange={(event) => {
          input.onChange(event);
          onChange && onChange(event);
        }}
        selectedKeys={
          items.some((item) => item.value === input.value) ? [input.value] : []
        }
      >
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.text}
          </SelectItem>
        )}
      </Select>
    )}
  </Field>
);

export default FormSelect;

import { Field } from 'react-final-form';
import { Input, Textarea, Grid } from '@nextui-org/react';

type Props = {
  id: string;
  name: string;
  required?: boolean;
  type?: string;
  helperText?: string;
  clearable?: boolean;
  multiLine?: boolean;
};

const ReciptInput = ({
  id,
  name,
  required,
  type,
  helperText,
  clearable,
  multiLine,
}: Props): JSX.Element => (
  <Grid>
    <Field name={name}>
      {(props) => {
        return (
          <div>
            {!multiLine ? (
              <Input
                id={id}
                label={name}
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
                bordered
                color="primary"
                required={required}
                type={type}
                helperText={helperText}
                clearable={clearable}
                size="md"
              />
            ) : (
              <Textarea
                id={id}
                label={name}
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
                bordered
                color="primary"
                required={required}
                helperText={helperText}
                minRows={2}
                fullWidth
              />
            )}
          </div>
        );
      }}
    </Field>
  </Grid>
);

export default ReciptInput;

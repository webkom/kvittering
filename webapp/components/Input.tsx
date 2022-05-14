import { Field } from 'react-final-form';
import { Input, Textarea, Grid } from '@nextui-org/react';
import styles from './Input.module.css';

type Props = {
  id: string;
  name: string;
  required?: boolean;
  type?: string;
  helperText?: string;
  fullWidth?: boolean;
  clearable?: boolean;
  contentRight?: JSX.Element;
  multiLine?: boolean;
};

const ReceiptInput = ({
  id,
  name,
  required,
  type,
  helperText,
  clearable,
  contentRight,
  multiLine,
  fullWidth,
}: Props): JSX.Element => (
  <Grid>
    <Field name={name}>
      {(props) => {
        return (
          <>
            {!multiLine ? (
              <Input
                id={id}
                labelPlaceholder={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
                required={required}
                type={type}
                helperText={helperText}
                contentRight={contentRight}
                clearable={clearable}
                fullWidth={fullWidth}
                underlined
                color="primary"
                className={styles.input}
              />
            ) : (
              <Textarea
                id={id}
                label={name}
                name={props.input.name}
                value={props.input.value}
                onChange={props.input.onChange}
                underlined
                color="primary"
                required={required}
                helperText={helperText}
                minRows={2}
                fullWidth={fullWidth}
              />
            )}
          </>
        );
      }}
    </Field>
  </Grid>
);

export default ReceiptInput;

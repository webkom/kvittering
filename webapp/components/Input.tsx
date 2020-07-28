import React from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import styles from './Input.module.css';

type Props = {
  name: string;
  value: string;
  updateForm: (value: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  adornment?: string;
  fullWidth?: boolean;
};

const Input = ({
  name,
  value,
  updateForm,
  required,
  type,
  multiline,
  adornment,
  fullWidth,
}: Props): JSX.Element => (
  <TextField
    id={name}
    label={name}
    margin="normal"
    className={styles.textField}
    variant="outlined"
    required={required}
    onChange={(e) => updateForm(e.target.value)}
    value={value}
    type={type}
    multiline={multiline}
    fullWidth={fullWidth}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">{adornment}</InputAdornment>
      ),
    }}
  />
);

export default Input;

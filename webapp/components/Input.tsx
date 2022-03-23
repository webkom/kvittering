import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
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
  helperText?: string;
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
  helperText,
}: Props): JSX.Element => (
  <TextField
    id={name}
    label={name}
    margin="normal"
    className={!fullWidth ? styles.textField : styles.default} // Hack to limit our css on fullWidth
    variant="outlined"
    required={required}
    onChange={(e) => updateForm(e.target.value)}
    value={value}
    type={type}
    multiline={multiline}
    fullWidth={fullWidth}
    helperText={helperText}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">{adornment || ''}</InputAdornment>
      ),
    }}
  />
);

export default Input;

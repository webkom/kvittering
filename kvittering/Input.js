import React from 'react';

import globals from './globals.css';

const Input = ({ name, value, updateForm, field, required }) => (
  <div className={globals.inputField}>
    <div className={globals.inputLabel}>
      {name}
      {required && <span style={{ color: '#e90000' }}>*</span>}
    </div>
    <input
      onChange={e => updateForm({ [field]: e.target.value })}
      value={value}
    />
  </div>
);

export default Input;

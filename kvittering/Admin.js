import React from 'react';

import TexUpload from './TexUpload';
import SignatureUpload from './SignatureUpload';

import styles from './Form.css';
import globals from './globals.css';

const requiredFields = {
  date2: true,
  signature: true,
  tex: true,
  mailto: true
};

const Input = ({ name, value, updateForm, field }) => (
  <div className={globals.inputField}>
    <div className={globals.inputLabel}>
      {name}
      {requiredFields[field] && <span style={{ color: '#e90000' }}>*</span>}
    </div>
    <input
      onChange={e => updateForm({ [field]: e.target.value })}
      value={value}
    />
  </div>
);

const inputIsValid = form =>
  Object.keys(form)
    .filter(field => requiredFields[field])
    .filter(field => form[field].length === 0).length === 0;

class Admin extends React.Component {
  state = {
    form: {
      signature2: '',
      comment2: '',
      mailto: '',
      date2: ''
    },
    submitted: false
  };
  render() {
    const updateForm = state =>
      this.setState({ form: { ...this.state.form, ...state } });
    return (
      <div className={styles.container}>
        <Input
          name={'Bokføringsdato'}
          value={this.state.form.date2}
          field="date2"
          updateForm={updateForm}
        />
        <Input
          name={'Kommentar'}
          value={this.state.form.comment2}
          field="comment2"
          updateForm={updateForm}
        />
        <Input
          name={'Epost'}
          value={this.state.form.mailto}
          field="mailto"
          updateForm={updateForm}
        />
        <SignatureUpload field="signature2" updateForm={updateForm} />
        <TexUpload field="tex" updateForm={updateForm} />

        {inputIsValid(this.state.form) &&
          !this.state.submitted && (
            <div>
              <button
                className={styles.submit}
                onClick={() => {
                  console.log(this.state);
                  this.setState({ submitted: true });
                  fetch(
                    //'/kaaf', {
                    'https://kaaf.abakus.no/async',
                    {
                      method: 'POST',
                      body: JSON.stringify(this.state.form)
                    }
                  );
                }}
              >
                Generer kvitteringsskildring
              </button>
            </div>
          )}

        {this.state.submitted && (
          <div className={styles.feedback}>
            Genererer kvitteringsskildring, den vil bli sendt på mail når den er
            ferdig
          </div>
        )}
      </div>
    );
  }
}

export default Admin;

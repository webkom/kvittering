import React from 'react';

import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';

import styles from './Form.css';
import globals from './globals.css';

const requiredFields = {
  name: true,
  date: true,
  accountNumber: true,
  amount: true,
  signature: true,
  images: true,
  mailfrom: true
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

class Form extends React.Component {
  state = {
    form: {
      images: [],
      signature: '',
      name: '',
      date: '',
      committee: '',
      accountNumber: '',
      occasion: '',
      amount: '',
      comment: '',
      mailto: '',
      mailfrom: ''
    },
    submitted: false
  };
  render() {
    const updateForm = state =>
      this.setState({ form: { ...this.state.form, ...state } });
    return (
      <div className={styles.container}>
        <Input
          name={'Navn'}
          value={this.state.form.name}
          field="name"
          updateForm={updateForm}
        />
        <Input
          name={'Kjøpsdato'}
          value={this.state.form.date}
          field="date"
          updateForm={updateForm}
        />
        <Input
          name={'Komité'}
          value={this.state.form.committee}
          field="committee"
          updateForm={updateForm}
        />
        <Input
          name={'Kontonummer'}
          value={this.state.form.accountNumber}
          field="accountNumber"
          updateForm={updateForm}
        />
        <Input
          name={'Annledning'}
          value={this.state.form.occasion}
          field="occasion"
          updateForm={updateForm}
        />
        <Input
          name={'Beløp'}
          value={this.state.form.amount}
          field="amount"
          updateForm={updateForm}
        />
        <Input
          name={'Kommentar'}
          value={this.state.form.comment}
          field="comment"
          updateForm={updateForm}
        />
        <Input
          name={'Din epost'}
          value={this.state.form.mailfrom}
          field="mailfrom"
          updateForm={updateForm}
        />
        <Input
          name={'Økans (epost)'}
          value={this.state.form.mailto}
          field="mailto"
          updateForm={updateForm}
        />
        <SignatureUpload updateForm={updateForm} />
        <PictureUpload updateForm={updateForm} />

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

export default Form;

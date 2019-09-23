import React from 'react';

import Input from './Input';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';

import styles from './Form.css';
import globals from './globals.css';

const requiredFields = {
  date: true,
  amount: true,
  images: true,
  mailto: true
};

const personalFields = {
  name: true,
  accountNumber: true,
  signature: true,
  mailfrom: true
};

const inputIsValid = form => {
  return (
    Object.keys(form)
      .filter(field => requiredFields[field] || personalFields[field])
      .filter(field => form[field].length === 0).length === 0
  );
};

class Form extends React.Component {
  state = {
    form: {
      images: [],
      date: '',
      occasion: '',
      amount: '',
      comment: '',
      mailto: '',
      signature: '',
      name: '',
      committee: '',
      accountNumber: '',
      mailfrom: ''
    },
    submitted: false,
    finished: false,
    response: ''
  };
  render() {
    const updateForm = state =>
      this.setState({ form: { ...this.state.form, ...state } });
    return (
      <div className={styles.container}>
        <Input
          key="name"
          name="Navn"
          value={this.state.form.name}
          field="name"
          required
          updateForm={updateForm}
        />
        <Input
          key="committee"
          name="Komité"
          value={this.state.form.committee}
          field="committee"
          updateForm={updateForm}
        />
        <Input
          key="accountNumber"
          name="Kontonummer"
          value={this.state.form.accountNumber}
          field="accountNumber"
          required
          updateForm={updateForm}
        />
        <Input
          key="mailfrom"
          name="Din epost"
          value={this.state.form.mailfrom}
          field="mailfrom"
          required
          updateForm={updateForm}
        />
        <SignatureUpload key="signature" updateForm={updateForm} />
        <Input
          name="Kjøpsdato"
          value={this.state.form.date}
          field="date"
          required
          updateForm={updateForm}
        />
        <Input
          name="Anledning"
          value={this.state.form.occasion}
          field="occasion"
          updateForm={updateForm}
        />
        <Input
          name="Beløp"
          value={this.state.form.amount}
          field="amount"
          required
          updateForm={updateForm}
        />
        <Input
          name="Kommentar"
          value={this.state.form.comment}
          field="comment"
          updateForm={updateForm}
        />
        <Input
          name="Økans (epost)"
          value={this.state.form.mailto}
          field="mailto"
          required
          updateForm={updateForm}
        />
        <PictureUpload updateForm={updateForm} />

        {inputIsValid(this.state.form) &&
          !this.state.submitted && (
            <button
              className={styles.submit}
              onClick={() => {
                console.log(this.state);
                this.setState({ submitted: true });
                fetch(
                  process.env.API_URL ? '/kaaf' : 'https://kaaf.abakus.no/',
                  {
                    method: 'POST',
                    body: JSON.stringify(this.state.form)
                  }
                )
                  .then(r => {
                    return r.text();
                  })
                  .then(text => {
                    this.setState({ finished: true, response: text });
                  })
                  .catch(() => this.setState({ finished: true }));
              }}
            >
              Generer kvitteringsskildring
            </button>
          )}

        {this.state.submitted && (
          <div className={styles.feedback}>
            {this.state.finished
              ? this.state.response.length != 0
                ? this.state.response
                : 'Det skjedde en uventet feil, kontakt Webkom eller prøv igjen.'
              : 'Genererer kvitteringsskildring...'}
          </div>
        )}
      </div>
    );
  }
}

export default Form;

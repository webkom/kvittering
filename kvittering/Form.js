import React from 'react';

import Input from './Input';
import PictureUpload from './PictureUpload';
import SignatureUpload from './SignatureUpload';
import TexUpload from './TexUpload';

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
  if (form.tex.lenght === 0) {
    return (
      Object.keys(form)
        .filter(field => requiredFields[field] || personalFields[field])
        .filter(field => form[field].length === 0).length === 0
    );
  }
  return (
    Object.keys(form)
      .filter(field => requiredFields[field])
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
      tex: '',
      signature: '',
      name: '',
      committee: '',
      accountNumber: '',
      mailfrom: ''
    },
    submitted: false
  };
  render() {
    const updateForm = state =>
      this.setState({ form: { ...this.state.form, ...state } });
    return (
      <div className={styles.container}>
        <TexUpload field="tex" updateForm={updateForm} />
        {this.state.form.tex.length === 0 && [
          <Input
            key="name"
            name="Navn"
            title="Navnet til kjøper"
            value={this.state.form.name}
            field="name"
            required
            updateForm={updateForm}
          >
            <h1 class="tooltiptext">Tooltip text here</h1>
          </Input>,
          <Input
            key="committee"
            name="Komité"
            title="Komitéen det er kjøpt på vegne av"
            value={this.state.form.committee}
            field="committee"
            updateForm={updateForm}
          />,
          <Input
            key="accountNumber"
            name="Kontonummer"
            title="Der pengene skal tilbake til, ofte ditt eget kontonummer"
            value={this.state.form.accountNumber}
            field="accountNumber"
            required
            updateForm={updateForm}
          />,
          <Input
            key="mailfrom"
            name="Din epost"
            title="Du vil få en kopi av kvitteringsskildringen på mail"
            value={this.state.form.mailfrom}
            field="mailfrom"
            required
            updateForm={updateForm}
          />,
          <SignatureUpload
            key="signature"
            title="Din håndskrevne signatur"
            updateForm={updateForm} />
        ]}
        <Input
          name="Kjøpsdato"
          title="Datoen det ble kjøpt, gjerne samme som på kvittering"
          value={this.state.form.date}
          field="date"
          required
          updateForm={updateForm}
        />
        <Input
          name="Anledning"
          title="I hvilken anledning ble dette kjøpt?"
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
          title="Her kan du skrive ytterligere informasjon"
          value={this.state.form.comment}
          field="comment"
          updateForm={updateForm}
        />
        <Input
          name="Økans (epost)"
          title="Epostadressen til økonomiansvarlig"
          value={this.state.form.mailto}
          field="mailto"
          required
          updateForm={updateForm}
        />
        <PictureUpload
          title="Last opp kvitteringer, vedlegg osv."
          updateForm={updateForm} />

        {inputIsValid(this.state.form) &&
          !this.state.submitted && (
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

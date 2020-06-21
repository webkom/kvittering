import { useState } from "react";

import Input from "./Input";
import PictureUpload from "./PictureUpload";
import SignatureUpload from "./SignatureUpload";

import styles from "./Form.module.css";

const Form = () => {
  const [images, setImages] = useState<Array<string>>([]);
  const [date, setDate] = useState("");
  const [occasion, setOccasion] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [mailto, setMailto] = useState("");
  const [signature, setSignature] = useState("");
  const [name, setName] = useState("");
  const [committee, setCommittee] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mailfrom, setMailfrom] = useState("");

  const [submitted, setSumbitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  return (
    <div className={styles.container}>
      <Input name="Navn" value={name} required updateForm={setName} />
      <Input name="Komité" value={committee} updateForm={setCommittee} />
      <Input
        name="Kontonummer"
        value={accountNumber}
        required
        updateForm={setAccountNumber}
      />
      <Input
        name="Din epost"
        value={mailfrom}
        required
        updateForm={setMailfrom}
      />
      <SignatureUpload updateForm={setSignature} />
      <Input name="Kjøpsdato" value={date} required updateForm={setDate} />
      <Input name="Anledning" value={occasion} updateForm={setOccasion} />
      <Input name="Beløp" value={amount} required updateForm={setAmount} />
      <Input name="Kommentar" value={comment} updateForm={setComment} />
      <Input
        name="Økans (epost)"
        value={mailto}
        required
        updateForm={setMailto}
      />
      <PictureUpload updateForm={setImages} />

      {submitted && (
        <div className={styles.feedback}>
          {responseMessage || "Genererer kvitteringsskjema..."}
        </div>
      )}

      <button
        className={styles.submit}
        onClick={() => {
          setSumbitted(true);
          fetch(`${process.env.API_URL || ""}/kaaf`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              images,
              date,
              occasion,
              amount,
              comment,
              mailto,
              signature,
              name,
              committee,
              accountNumber,
              mailfrom
            })
          })
            .then(r => {
              return r.text();
            })
            .then(text => {
              setResponseMessage(text);
            })
            .catch(e => setResponseMessage(e.text()));
        }}
      >
        Generer kvitteringsskjema
      </button>
    </div>
  );
};

export default Form;

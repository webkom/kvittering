import React, { useState } from 'react';
import styles from './FileUpload.module.css';
import globals from './globals.module.css';

type Props = {
  updateForm: (value: string) => void;
};

const SignatureUpload = ({ updateForm }: Props): JSX.Element => {
  const [hasUploaded, setHasUploaded] = useState(false);
  return (
    <div className={globals.inputField}>
      <div className={globals.inputLabel}>
        Signatur
        <span style={{ color: '#e90000' }}>*</span>
      </div>
      <label>
        <input
          type="file"
          className={styles.fileInput}
          onChange={(e) => {
            if (e.target.files) {
              const reader = new FileReader();
              reader.readAsDataURL(e.target.files[0]);
              reader.addEventListener(
                'load',
                () => {
                  updateForm(reader.result as string);
                  setHasUploaded(true);
                },
                false
              );
            }
          }}
        />
        <div className={styles.fileLabel}>
          {hasUploaded ? (
            <div className={styles.uploaded}>Signatur er lastet opp</div>
          ) : (
            <div>Last opp signatur</div>
          )}
        </div>
      </label>
    </div>
  );
};
export default SignatureUpload;

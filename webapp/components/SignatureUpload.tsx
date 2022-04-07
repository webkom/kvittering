import React, { useState } from 'react';
import styles from './FileUpload.module.css';
import IconButton from '@mui/material/IconButton';
import GestureIcon from '@mui/icons-material/Gesture';
import CreateIcon from '@mui/icons-material/Create';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Sign from './Sign';

type Props = {
  updateForm: (value: string) => void;
  setSignature: (value: string) => void;
};

const SignatureUpload = ({ updateForm, setSignature }: Props): JSX.Element => {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.upload}>
      <label>
        <input
          id="signature"
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
            <div className={styles.uploadedElement}>Signatur lastet opp</div>
          ) : (
            <>
              <AttachFileIcon />
              <span>Last opp signatur</span>
            </>
          )}
        </div>
      </label>
      <IconButton
        id="signButton"
        aria-label="delete"
        size="medium"
        onClick={() => setIsOpen(true)}
      >
        <div>
          <p style={{ fontSize: '10px', margin: 0 }}>Eller tegn</p>
          <GestureIcon />
          <CreateIcon />
        </div>
      </IconButton>

      <Sign
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        setSignature={setSignature}
        setHasUploaded={setHasUploaded}
      />
    </div>
  );
};
export default SignatureUpload;

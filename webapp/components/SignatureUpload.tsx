import { useState } from 'react';
import styles from './FileUpload.module.css';
import IconButton from '@mui/material/IconButton';
import { MdAttachFile, MdCheck } from 'react-icons/md';
import { FaSignature, FaPencilAlt } from 'react-icons/fa';
import Sign from './Sign';
import { Text } from '@nextui-org/react';

type Props = {
  signature: string;
  updateForm: (value: string) => void;
  setSignature: (value: string) => void;
};

const SignatureUpload = ({
  signature,
  updateForm,
  setSignature,
}: Props): JSX.Element => {
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
                },
                false
              );
            }
          }}
        />
        <div className={styles.fileLabel}>
          {signature !== '' ? (
            <>
              <Text color="success" css={{ lineHeight: 0, marginRight: '5px' }}>
                <MdCheck size={20} />
              </Text>
              <Text color="success">Signatur lastet opp</Text>
            </>
          ) : (
            <>
              <MdAttachFile size={24} />
              <Text>Last opp signatur</Text>
            </>
          )}
        </div>
      </label>
      <IconButton
        id="signButton"
        className={styles.signButton}
        size="medium"
        onClick={() => setIsOpen(true)}
      >
        <div>
          <p style={{ fontSize: '10px', margin: 0 }}>Eller tegn</p>
          <FaSignature size={18} />
          <FaPencilAlt size={18} />
        </div>
      </IconButton>

      <Sign
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        setSignature={setSignature}
      />
    </div>
  );
};

export default SignatureUpload;

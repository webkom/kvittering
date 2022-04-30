import { useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { MdOutlineClose } from 'react-icons/md';
import Modal from 'react-modal';
import { Button, Text } from '@nextui-org/react';
import styles from './Sign.module.css';
import IconButton from '@mui/material/IconButton';

type Props = {
  modalIsOpen: boolean;
  setIsOpen: (state: boolean) => void;
  setSignature: (data: string) => void;
  setHasUploaded: (state: boolean) => void;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px',
  },
};

const Sign = ({
  modalIsOpen,
  setIsOpen,
  setSignature,
  setHasUploaded,
}: Props): JSX.Element => {
  const [sigCanvas, setSigCanvas] = useState<any>({});
  const [width, setWidth] = useState(700);
  const [rotated, setRotated] = useState(false);

  const resize = () => setWidth(Math.min(window.innerWidth - 50, 700));
  const rotate = () => setRotated(!rotated);

  useEffect(() => {
    setWidth(Math.min(window.innerWidth - 50, 700));
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', rotate);
    return () => {
      window.removeEventListener('resize', resize);
      window.addEventListener('orientationchange', rotate);
    };
  });

  const base64Encode = () => {
    setSignature(sigCanvas.getTrimmedCanvas().toDataURL('image/png'));
    setHasUploaded(true);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setIsOpen(false)}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className={styles.nav}>
        <Text h3>Signer i feltet under</Text>
        <IconButton size="medium" onClick={() => setIsOpen(false)}>
          <MdOutlineClose />
        </IconButton>
      </div>
      <p
        style={{
          margin: 0,
          fontStyle: 'italic',
          fontSize: '10px',
          marginBottom: '-5px',
        }}
      >
        Tips: Vend telefonen
      </p>
      <SignatureCanvas
        penColor="black"
        backgroundColor="white"
        canvasProps={{
          width,
          height: 200,
          style: { border: '1px dashed black', margin: '5px 0' },
        }}
        ref={(ref: any) => setSigCanvas(ref)}
      />
      <div className={styles.nav}>
        <Button onClick={() => sigCanvas.clear()}>Begynn på nytt</Button>
        <Button color="primary" onClick={base64Encode}>
          Bruk
        </Button>
      </div>
    </Modal>
  );
};

export default Sign;

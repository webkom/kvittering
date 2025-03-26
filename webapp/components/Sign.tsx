import { useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Modal, ModalContent, Spacer } from '@nextui-org/react';

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  setSignature: (data: string) => void;
};

const Sign = ({ isOpen, onOpenChange, setSignature }: Props): JSX.Element => {
  const [sigCanvas, setSigCanvas] = useState<any>({});
  const [width, setWidth] = useState(700);
  const [rotated, setRotated] = useState(false);

  const resize = () => setWidth(Math.min(window.innerWidth - 50, 700));
  const rotate = () => setRotated(!rotated);

  useEffect(() => {
    setWidth(Math.min(window.innerWidth - 80, 700));
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', rotate);
    return () => {
      window.removeEventListener('resize', resize);
      window.addEventListener('orientationchange', rotate);
    };
  });

  const base64Encode = (onClose: () => void) => {
    setSignature(sigCanvas.getTrimmedCanvas().toDataURL('image/png'));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={'3xl'}>
      <ModalContent>
        {(onClose) => (
          <div className={'flex p-3 gap-2 flex-col items-center'}>
            <h3>Signer i feltet under</h3>
            <p className={'text-xs -mb-2'}>Tips: Vend telefonen</p>
            <SignatureCanvas
              penColor="black"
              backgroundColor="white"
              canvasProps={{
                width,
                height: 200,
                style: { border: '1px dashed black', margin: '5px 0', width },
              }}
              ref={(ref: any) => setSigCanvas(ref)}
            />
            <div className="flex justify-between">
              <Button onPress={() => sigCanvas.clear()}>Begynn på nytt</Button>
              <Spacer x={4} />
              <Button color="primary" onPress={() => base64Encode(onClose)}>
                Bruk
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Sign;

import { MdAttachFile, MdCheck } from 'react-icons/md';
import { FaSignature, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import Sign from './Sign';
import { FormButton } from './elements';
import { Button, Card, Spacer, useDisclosure } from '@nextui-org/react';
import { useRef } from 'react';
import Image from 'next/image';

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
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className={'flex'}>
        <input
          ref={inputFileRef}
          id="signature"
          type="file"
          className={'hidden'}
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
              e.target.value = '';
            }
          }}
        />
        <FormButton
          color={signature === '' ? 'default' : 'success'}
          onPress={() => inputFileRef.current?.click()}
          startContent={
            signature === '' ? (
              <MdAttachFile size={20} />
            ) : (
              <MdCheck size={20} />
            )
          }
        >
          {signature === '' ? 'Last opp signatur' : 'Signatur lastet opp'}
        </FormButton>

        <Spacer x={4} />

        <Button
          className={'py-6 px-8'}
          id="signButton"
          isIconOnly
          onPress={onOpen}
          variant="ghost"
          startContent={
            <div className={'flex flex-col gap-1 items-center'}>
              <p className={'text-[10px]'}>Eller tegn</p>
              <div className={'flex gap-1'}>
                <FaSignature size={18} />
                <FaPencilAlt size={18} />
              </div>
            </div>
          }
        ></Button>
      </div>

      {signature !== '' && (
        <Card className={'mt-3 mb-6 border-1'} shadow="none">
          <Button
            className={'absolute right-2 top-2 shadow-md'}
            isIconOnly
            color={'danger'}
            onPress={() => setSignature('')}
          >
            <FaTrashAlt size={17} />
          </Button>
          <Image src={signature} alt={'Signatur'} width={700} height={200} />
        </Card>
      )}

      <Sign
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        setSignature={setSignature}
      />
    </>
  );
};

export default SignatureUpload;

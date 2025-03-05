import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import React from 'react';
import { FormButton } from './elements';
import { BiReceipt } from 'react-icons/bi';

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  submitting: boolean;
  hasValidationErrors: boolean;
  onSubmitExternal: () => void;
}

const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  submitting,
  hasValidationErrors,
  onSubmitExternal,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="w-[45vw] max-w-5xl"
    >
      <ModalContent>
        <ModalBody>
          <p className="mb-3 mt-8 text-center">
            Ved å godkjenne bekrefter jeg at beløpet stemmer med kvitteringen
          </p>
          <FormButton
            type="submit"
            color={submitting || hasValidationErrors ? 'default' : 'success'}
            className={
              (submitting || hasValidationErrors
                ? 'cursor-not-allowed'
                : 'cursor-pointer') + " mb-3"
            } 
            disabled={submitting || hasValidationErrors}
            startContent={<BiReceipt size={24} />}
            onPress={() => {
              onOpenChange();
              onSubmitExternal();
            }}
          >
            Godkjenn
          </FormButton>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;

import { useState, useEffect, useRef } from 'react';
import { FaRegQuestionCircle, FaTrashAlt } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { processFiles } from 'utils/fileHelper';
import Image from 'next/image';
import { FormButton } from './elements';

type FileNames = { [key: string]: string };

type Props = {
  images: string[];
  setImages: (value: Array<string>) => void;
};

const PictureUpload = ({ images, setImages }: Props): JSX.Element => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<FileNames>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setErrors([]), 5000);
    return () => clearTimeout(timer);
  }, [errors]);

  const removeImage = (base64?: string) => {
    setImages(images.filter((image) => image !== base64));
  };

  return (
    <>
      <div className="flex gap-3 items-center">
        <input
          ref={inputFileRef}
          id="attachments"
          type="file"
          className={'hidden'}
          multiple
          onChange={async (e) => {
            const { files, errors } = await processFiles(e.target.files);
            const base64Files = files.map((file) => file.base64);
            setImages(Array.from(new Set([...images, ...base64Files])));
            setErrors((prevErrors) => [...prevErrors, ...errors]);
            setFileNames((prevFileNames) => {
              const newFileNames = { ...prevFileNames };
              files.forEach((file) => (newFileNames[file.base64] = file.name));
              return newFileNames;
            });
            e.target.value = '';
          }}
        />
        <FormButton
          onPress={() => inputFileRef.current?.click()}
          startContent={<MdAttachFile size={20} />}
        >
          Last opp vedlegg
        </FormButton>
        <Popover placement="top">
          <PopoverTrigger>
            <span className="cursor-pointer">
              <FaRegQuestionCircle size={20} />
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="text-small font-bold">Krav til vedlegg</div>
              <div className="text-tiny my-1">
                Hvis vedlegget er en kvittering må den inneholde følgende for å
                være gyldig;
              </div>
              <div className="text-tiny">
                - <b>Kvitteringsnummer</b>: et nummer som gjør transaksjonen
                sporbar
              </div>
              <div className="text-tiny">
                - <b>Tidspunkt</b> for når kvitteringen er skrevet ut
              </div>
              <div className="text-tiny">
                - <b>Tidspunkt</b> og <b>sted</b> for levering av ytelsen
              </div>
              <div className="text-tiny">
                - <b>Selgers navn, adresse</b> og/eller{' '}
                <b>organisasjonsnummer</b>
              </div>
              <div className="text-tiny">
                - <b>Varespesifikasjon</b> og <b>betalingsmiddel</b>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="px-2">
        {errors.map((invalidUpload) => (
          <p className={'text-danger my-2'} key={invalidUpload}>
            {invalidUpload}
          </p>
        ))}
      </div>

      {images.length > 0 && (
        <div
          className={'grid grid-cols-2 mt-3 mb-6 gap-3'}
          id="uploadedAttachments"
        >
          {images.map((image) => (
            <Card key={image} className={'border-1'} shadow="none">
              <CardBody>
                <Image
                  src={image}
                  alt={fileNames[image]}
                  width={500}
                  height={500}
                />
              </CardBody>
              <CardFooter className={'justify-between'}>
                {fileNames[image] ?? ''}
                <Button
                  isIconOnly
                  color={'danger'}
                  onPress={() => removeImage(image)}
                >
                  <FaTrashAlt size={17} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default PictureUpload;

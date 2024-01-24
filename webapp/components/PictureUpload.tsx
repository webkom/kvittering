import { useState, useEffect } from 'react';
import styles from './FileUpload.module.css';
import { FaTrashAlt } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';

import { Button, Card, Grid, Text } from '@nextui-org/react';
import { processFiles } from 'utils/fileHelper';

type FileNames = { [key: string]: string };

type Props = {
  images: string[];
  setImages: (value: Array<string>) => void;
};

const PictureUpload = ({ images, setImages }: Props): JSX.Element => {
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
      <div className={styles.uploadButtonWrapper}>
        <label>
          <input
            id="attachments"
            type="file"
            className={styles.fileInput}
            multiple
            onChange={async (e) => {
              const { files, errors } = await processFiles(e.target.files);
              const base64Files = files.map((file) => file.base64);
              setImages(Array.from(new Set([...images, ...base64Files])));
              setErrors((prevErrors) => [...prevErrors, ...errors]);
              setFileNames((prevFileNames) => {
                const newFileNames = { ...prevFileNames };
                files.forEach(
                  (file) => (newFileNames[file.base64] = file.name)
                );
                return newFileNames;
              });
            }}
          />
          <div className={styles.uploadButton}>
            <MdAttachFile size={20} />
            <Text css={{ marginLeft: '5px' }}>Last opp vedlegg</Text>
          </div>
        </label>
      </div>

      <Grid.Container
        className={styles.uploadedWrapper}
        id="uploadedAttachments"
      >
        {errors.map((invalidUpload) => (
          <Text color={'error'} key={invalidUpload}>
            {invalidUpload}
          </Text>
        ))}
        {images.map((image) => (
          <Card className={styles.uploadedElement} key={image} variant="flat">
            <Card.Body>
              <Card.Image src={image} />
            </Card.Body>
            <Card.Footer css={{ justifyContent: 'space-between' }}>
              {fileNames[image] ?? ''}
              <Button
                color={'error'}
                onPress={() => removeImage(image)}
                icon={<FaTrashAlt size={17} />}
              ></Button>
            </Card.Footer>
          </Card>
        ))}
      </Grid.Container>
    </>
  );
};

export default PictureUpload;

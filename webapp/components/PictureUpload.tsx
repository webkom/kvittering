import { useState, useEffect } from 'react';
import styles from './FileUpload.module.css';
import IconButton from '@mui/material/IconButton';
import { FaTrashAlt } from 'react-icons/fa';
import { MdAttachFile } from 'react-icons/md';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Text } from '@nextui-org/react';

type Props = {
  images: string[];
  setImages: (value: Array<string>) => void;
};

const PictureUpload = ({ images, setImages }: Props): JSX.Element => {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    if (images.length === 0) setNames([]);
  }, [images]);

  const removeImage = (i: number) => {
    const newImages = images;
    const newNames = names;
    newImages.splice(i, 1);
    newNames.splice(i, 1);
    setImages([...newImages]);
    setNames(newNames);
  };

  return (
    <>
      <div className={styles.upload}>
        <label>
          <input
            id="attachments"
            type="file"
            className={styles.fileInput}
            multiple
            onChange={(e) => {
              const files = e.target.files || [];
              for (let i = 0; i < files.length; i++) {
                setNames((prevNames) => [...prevNames, files[i].name]);
                const reader = new FileReader();
                reader.readAsDataURL(files[i]);
                reader.addEventListener(
                  'load',
                  () => {
                    setImages([...images, reader.result as string]);
                  },
                  false
                );
              }
            }}
          />
          <div className={styles.fileLabel}>
            <MdAttachFile size={20} />
            <Text css={{ marginLeft: '5px' }}>Last opp vedlegg</Text>
          </div>
        </label>
      </div>

      {images.length > 0 && (
        <List
          component="nav"
          className={styles.uploaded}
          id="uploadedAttachments"
        >
          {images.map((image, i) => (
            <div className={styles.uploadedElement} key={image}>
              <ListItem>
                <ListItemText primary={names[i]} style={{ fontSize: '10px' }} />
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => removeImage(i)}
                  style={{ marginLeft: '5px' }}
                >
                  <FaTrashAlt size={17} color="f74d58" />
                </IconButton>
              </ListItem>
            </div>
          ))}
        </List>
      )}
    </>
  );
};

export default PictureUpload;

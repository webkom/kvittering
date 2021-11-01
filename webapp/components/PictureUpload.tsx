import React, { useState, useEffect } from 'react';
import styles from './FileUpload.module.css';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

type Props = {
  updateForm: (value: Array<string>) => void;
};

const PictureUpload = ({ updateForm }: Props): JSX.Element => {
  const [images, setImages] = useState<Array<string>>([]);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    updateForm(images);
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
                    setImages((prevImages) => [
                      ...prevImages,
                      reader.result as string,
                    ]);
                  },
                  false
                );
              }
            }}
          />
          <div className={styles.fileLabel}>
            <AttachFileIcon />
            Last opp vedlegg
          </div>
        </label>
      </div>

      {images.length > 0 && (
        <List component="nav" className={styles.uploaded}>
          {images.map((image, i) => (
            <div className={styles.uploadedElement} key={image}>
              <ListItem>
                <ListItemText primary={names[i]} style={{ fontSize: '10px' }} />
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => removeImage(i)}
                >
                  <DeleteIcon />
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

import React, { useState, useEffect } from 'react';
import styles from './FileUpload.module.css';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListItemText';

type Props = {
  updateForm: (value: Array<string>) => void;
};

const PictureUpload = ({ updateForm }: Props): JSX.Element => {
  const [images, setImages] = useState<Array<string>>([]);
  const [names, setNames] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (images.length === total) updateForm(images);
  }, [images, total]);

  const removeImage = (i: number) => {
    const newImages = images;
    const newNames = names;
    newImages.splice(i, 1);
    newNames.splice(i, 1);
    setImages(newImages);
    setNames(newNames);
    setTotal(total - 1);
  };

  return (
    <div className={styles.upload}>
      <label>
        <input
          type="file"
          className={styles.fileInput}
          multiple
          onChange={(e) => {
            const files = e.target.files || [];
            setTotal(files.length);
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
          <div>Last opp vedlegg</div>
        </div>
      </label>
      {images.length > 0 && (
        <List
          component="nav"
          subheader={<ListSubheader>Opplastede vedlegg</ListSubheader>}
        >
          {images.map((image, i) => (
            <div className={styles.uploaded} key={image}>
              <ListItem>
                <ListItemText primary={names[i]} />
                <IconButton
                  aria-label="delete"
                  size="medium"
                  onClick={() => removeImage(i)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            </div>
          ))}
        </List>
      )}
    </div>
  );
};

export default PictureUpload;

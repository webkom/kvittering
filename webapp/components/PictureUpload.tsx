import React, { useState, useEffect } from 'react';
import styles from './FileUpload.module.css';

type Props = {
  updateForm: (value: Array<string>) => void;
};

const PictureUpload = ({ updateForm }: Props): JSX.Element => {
  const [images, setImages] = useState<Array<string>>([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (images.length === total) updateForm(images);
  }, [images, total]);

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
          {images.length > 0 ? (
            <div className={styles.uploaded}>
              {`${images.length} vedlegg lastet opp`}
            </div>
          ) : (
            <div>Last opp vedlegg</div>
          )}
        </div>
      </label>
    </div>
  );
};

export default PictureUpload;

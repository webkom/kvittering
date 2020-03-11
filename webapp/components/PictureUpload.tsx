import { useState, useEffect } from "react";
import styles from "./FileUpload.module.css";
import globals from "./globals.module.css";

type Props = {
  updateForm: (value: Array<string>) => void;
};

const PictureUpload = ({ updateForm }: Props) => {
  const [images, setImages] = useState<Array<string>>([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (images.length === total) updateForm(images);
  }, [images, total]);
  return (
    <div className={globals.inputField}>
      <div className={globals.inputLabel}>
        Vedlegg
        <span style={{ color: "#e90000" }}>*</span>
      </div>
      <label>
        <input
          type="file"
          className={styles.fileInput}
          multiple
          onChange={e => {
            const files = e.target.files || [];
            setTotal(files.length);
            for (let i = 0; i < files.length; i++) {
              const reader = new FileReader();
              reader.readAsDataURL(files[i]);
              reader.addEventListener(
                "load",
                () => {
                  setImages(prevImages => [
                    ...prevImages,
                    reader.result as string
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
              {`${images.length} bilder lastet opp`}
            </div>
          ) : (
            <div>Last opp kvitteringer, fakturaer og vedlegg</div>
          )}
        </div>
      </label>
    </div>
  );
};

export default PictureUpload;

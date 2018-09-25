import React from 'react';

import styles from './FileUpload.css';
import globals from './globals.css';

class PictureUpload extends React.Component {
  state = { images: [], total: 0 };
  handleUpload(e) {
    this.setState({ total: this.state.total + e.target.files.length });
    for (let i = 0; i < e.target.files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[i]);
      reader.addEventListener(
        'load',
        () => {
          this.setState(
            state => ({
              images: [...state.images, reader.result.split(',')[1]]
            }),
            () => {
              if (this.state.images.length === this.state.total)
                this.props.updateForm({ images: this.state.images });
            }
          );
        },
        false
      );
    }
  }

  render() {
    return (
      <div className={globals.inputField}>
        <div className={globals.inputLabel}>Vedlegg</div>
        <label>
          <input
            type="file"
            className={styles.fileInput}
            multiple
            onChange={e => this.handleUpload(e)}
          />
          <div className={styles.fileLabel}>
            {this.state.total > 0 ? (
              <div className={styles.uploaded}>
                {`${this.state.images.length}/${
                  this.state.total
                } bilder lastet opp`}
              </div>
            ) : (
              <div>Last opp kvitteringer, fakturaer og vedlegg</div>
            )}
          </div>
        </label>
      </div>
    );
  }
}

export default PictureUpload;

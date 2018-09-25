import React from 'react';

import styles from './FileUpload.css';
import globals from './globals.css';

class TexUpload extends React.Component {
  state = { hasUploaded: false };
  handleUpload(e) {
    const reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.addEventListener(
      'load',
      () => {
        this.props.updateForm({ [this.props.field]: reader.result });
        this.setState({ hasUploaded: true });
      },
      false
    );
  }

  render() {
    return (
      <div className={globals.inputField}>
        <div className={globals.inputLabel}>Tex-fil</div>
        <label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={e => this.handleUpload(e)}
          />
          <div className={styles.fileLabel}>
            {this.state.hasUploaded ? (
              <div className={styles.uploaded}>Lastet opp</div>
            ) : (
              <div>Last opp tex-filen du fikk på mail</div>
            )}
          </div>
        </label>
      </div>
    );
  }
}

export default TexUpload;

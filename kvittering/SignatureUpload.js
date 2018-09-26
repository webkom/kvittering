import React from 'react';

import styles from './FileUpload.css';
import globals from './globals.css';

class SignatureUpload extends React.Component {
  state = { hasUploaded: false };
  handleUpload(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.addEventListener(
      'load',
      () => {
        this.props.updateForm({
          [this.props.field || 'signature']: reader.result.split(',')[1]
        });
        this.setState({ hasUploaded: true });
      },
      false
    );
  }

  render() {
    return (
      <div className={globals.inputField}>
        <div className={globals.inputLabel}>
          Signatur
          <span style={{ color: '#e90000' }}>*</span>
        </div>
        <label>
          <input
            type="file"
            className={styles.fileInput}
            onChange={e => this.handleUpload(e)}
          />
          <div className={styles.fileLabel}>
            {this.state.hasUploaded ? (
              <div className={styles.uploaded}>Signatur er lastet opp</div>
            ) : (
              <div>Last opp signatur</div>
            )}
          </div>
        </label>
      </div>
    );
  }
}

export default SignatureUpload;

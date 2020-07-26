import React from 'react';
import Form from 'components/Form';

import styles from './index.module.css';

const Abakus = (): JSX.Element => (
  <div className={styles.logo}>
    <div className={styles.circle} />
    <div>Abakus</div>
  </div>
);

const App = (): JSX.Element => (
  <div>
    <div className={styles.header}>
      <Abakus />
      <div>Kvitteringsskjema</div>
    </div>
    <div className={styles.container}>
      <Form />
    </div>
  </div>
);

export default App;

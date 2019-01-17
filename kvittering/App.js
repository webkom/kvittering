import React from 'react';

import Form from './Form.js';
import CreateTemplate from './CreateTemplate.js';

import styles from './App.css';

const Abakus = () => (
  <div className={styles.logo}>
    <div className={styles.circle} />
    <div className = {styles.Abakus}> Abakus </div>
  </div>
);

const App = () => (
  <div>
    <div className={styles.header}>
      <Abakus />
      <div>Kvitteringsskildring</div>
    </div>
    <div className={styles.container}>
      {window.location.pathname === '/template' ? <CreateTemplate /> : <Form />}
    </div>
  </div>
);

export default App;

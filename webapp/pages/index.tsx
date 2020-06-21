import Form from "components/Form";

import styles from "./index.module.css";

const Abakus = () => (
  <div className={styles.logo}>
    <div className={styles.circle} />
    <div>Abakus</div>
  </div>
);

const App = () => (
  <div>
    <div className={styles.header}>
      <Abakus />
      <div>Kvitterinsskjema</div>
    </div>
    <div className={styles.container}>
      <Form />
    </div>
  </div>
);

export default App;

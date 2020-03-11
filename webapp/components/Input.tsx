import globals from "./globals.module.css";

type Props = {
  name: string;
  value: string;
  updateForm: (value: string) => void;
  required?: boolean;
};

const Input = ({ name, value, updateForm, required }: Props) => (
  <div className={globals.inputField}>
    <div className={globals.inputLabel}>
      {name}
      {required && <span style={{ color: "#e90000" }}>*</span>}
    </div>
    <input onChange={e => updateForm(e.target.value)} value={value} />
  </div>
);

export default Input;

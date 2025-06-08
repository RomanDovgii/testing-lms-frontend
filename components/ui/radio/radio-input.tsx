import styles from './radio-input.module.css'

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string,
  isDisabled: boolean
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, id, name, isDisabled, ...props }) => {
  const radioId = id || `radio-${Math.random().toString(36).slice(2, 9)}`

  return (
    <label htmlFor={radioId} className={isDisabled ? styles.radioInputDisabled : styles.radioInput}>
      <input
        type="radio"
        id={radioId}
        name={name}
        className={styles.radio}
        {...props}
      />
      <span className={styles.labelText}>{label}</span>
    </label>
  )
}

export default RadioButton
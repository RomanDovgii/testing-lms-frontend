import styles from "./checkbox-input.module.css"

interface checkboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string,
    isDisabled: boolean
}

const CheckboxInput: React.FC<checkboxProps> = ({label, id, isDisabled, ...props}) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    
    return (
        <label htmlFor={checkboxId} className={`${isDisabled ? styles.checkboxInputDisabled : ``} ${styles.checkboxInput}`}>
            <input type="checkbox" id={checkboxId} {...props} />
            <span>{label}</span>
        </label>
    )
}

export default CheckboxInput;
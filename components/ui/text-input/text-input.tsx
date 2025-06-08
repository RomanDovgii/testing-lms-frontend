import styles from "./text-input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    description: string,
    isDescriptionHidden: boolean,
    isDisabled: boolean,
};

const TextInput: React.FC<InputProps> = ({description, isDescriptionHidden, isDisabled, ...props}) => {
    return (
    <label className={isDisabled ? styles.labelDisabled : styles.label}>
        <span className={isDescriptionHidden ? styles.visuallyHidden : styles.text}>{description}</span>
        <input className={isDescriptionHidden ? styles.textInput : styles.textInputWithDescription} {...props} />
    </label>
    )
}

export default TextInput;
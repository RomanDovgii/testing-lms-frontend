import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ children, type, ...props }) => {
  return (
    <button className={styles.inputButton} {...props} type={type}>
      {children}
    </button>
  )
}

export default Button;
import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SmallButton: React.FC<ButtonProps> = ({ children, type, ...props }) => {
  return (
    <button className={styles.inputButton} {...props} type={type}>
      {children}
    </button>
  )
}

export default SmallButton;
import Link from "next/link";
import styles from "./Button.module.css";

const variants = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

export default function Button({
  href,
  children,
  variant = "primary",
  fullWidth = false,
  type = "button",
  className = "",
  ...props
}) {
  const classes = [
    styles.button,
    variants[variant] || styles.primary,
    fullWidth ? styles.full : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

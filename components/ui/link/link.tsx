import React from 'react';
import NextLink from 'next/link';
import styles from './link.module.css';

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

const Link: React.FC<LinkProps> = ({ href, children, className }) => {
  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.inputLink}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink href={href} className={styles.inputLink}>
      {children}
    </NextLink>
  )
}

export default Link;
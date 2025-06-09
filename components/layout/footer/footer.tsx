'use client';

import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        display: 'block',
        height: '4.375em',
        background: 'rgb(31, 41, 54)',
        textAlign: 'center',
        padding: '16px 50px',
      }}
    >
    </AntFooter>
  );
};

export default Footer;

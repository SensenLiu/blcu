import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        backgroundColor: '#f0f2f5',
        marginTop: 'auto',
      }}
    >
      <div style={{ marginBottom: 8 }}>
        北京语言大学读写研究中心 © {new Date().getFullYear()}
      </div>
      <div style={{ fontSize: '12px', color: '#999' }}>
        致力于提升学生读写能力，促进学术交流与发展
      </div>
    </AntFooter>
  );
};

export default Footer;

import React from 'react';
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Footer from './Footer';

const { Content } = AntLayout;

const Layout = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ marginTop: 64 }}>
        {children}
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;

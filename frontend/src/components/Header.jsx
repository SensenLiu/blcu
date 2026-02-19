import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import { HomeOutlined, TrophyOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isContestant, isJudge } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => {
        if (isContestant) {
          navigate('/contestant');
        } else if (isJudge) {
          navigate('/judge');
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/contests',
      icon: <TrophyOutlined />,
      label: <Link to="/contests">竞赛活动</Link>,
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#003d7a',
        padding: '0 50px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            marginRight: '50px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          北京语言大学读写研究中心
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: 'transparent',
            border: 'none',
          }}
        />
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ color: 'white', cursor: 'pointer' }}>
              <UserOutlined />
              <span>{user?.full_name || user?.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="link" onClick={() => navigate('/login')} style={{ color: 'white' }}>
              登录
            </Button>
            <Button type="primary" ghost onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Radio, Alert, Result } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [role, setRole] = useState('contestant');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result?.pending_approval) {
        setPendingApproval(true);
      } else {
        navigate('/contestant');
      }
    } catch (error) {
      console.error('Register failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
        <Card style={{ width: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#003d7a' }} />}
            title="评委注册申请已提交"
            subTitle="请等待管理员审批，审批通过后即可使用账号登录。"
            extra={<Button type="primary" onClick={() => navigate('/login')}>返回登录</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        padding: '40px 0',
      }}
    >
      <Card style={{ width: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>注册账号</Title>
          <p style={{ color: '#999' }}>北京语言大学读写研究中心</p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          size="large"
          autoComplete="off"
          layout="vertical"
          initialValues={{ role: 'contestant' }}
        >
          <Form.Item label="注册身份" name="role">
            <Radio.Group onChange={(e) => setRole(e.target.value)}>
              <Radio value="contestant">参赛选手</Radio>
              <Radio value="judge">评委</Radio>
            </Radio.Group>
          </Form.Item>

          {role === 'judge' && (
            <Alert
              message="评委注册需经管理员审批，审批通过后方可登录"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 8, message: '密码至少8个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="password_confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item label="真实姓名" name="full_name">
            <Input prefix={<UserOutlined />} placeholder="真实姓名" />
          </Form.Item>

          <Form.Item label="联系电话" name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="联系电话" />
          </Form.Item>

          <Form.Item label="所属单位" name="organization">
            <Input prefix={<BankOutlined />} placeholder="学校或单位" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {role === 'judge' ? '提交注册申请' : '注册'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;

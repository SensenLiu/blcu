import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Typography, Tag, Button, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { contestsAPI } from '../../services/api';

const { Title } = Typography;

const MySubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await contestsAPI.getMySubmissions();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      draft: { text: '草稿', color: 'default' },
      submitted: { text: '已提交', color: 'processing' },
      under_review: { text: '评审中', color: 'warning' },
      reviewed: { text: '已评审', color: 'success' },
    };
    const info = statusMap[status] || statusMap.draft;
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const columns = [
    {
      title: '参赛编号',
      dataIndex: 'submission_number',
      key: 'submission_number',
      width: 150,
    },
    {
      title: '作品标题',
      dataIndex: 'work_title',
      key: 'work_title',
    },
    {
      title: '竞赛名称',
      dataIndex: 'contest_name',
      key: 'contest_name',
    },
    {
      title: '组别',
      dataIndex: 'category_name',
      key: 'category_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (text) => (text ? new Date(text).toLocaleString('zh-CN') : '-'),
    },
  ];

  return (
    <div className="page-container">
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/contestant')}
          >
            返回选手中心
          </Button>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            我的作品
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/contestant/submit')}
          >
            提交新作品
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: '暂无作品提交记录' }}
        />
      </Card>
    </div>
  );
};

export default MySubmissions;

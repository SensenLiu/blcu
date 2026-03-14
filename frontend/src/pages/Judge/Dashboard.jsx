import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Typography, Tag, Button, Statistic, Row, Col } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { reviewsAPI } from '../../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await reviewsAPI.getMyAssignments();
      setAssignments(data?.results || data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (assignment) => {
    if (assignment.has_review) {
      return <Tag color="success">已评审</Tag>;
    }
    return <Tag color="warning">待评审</Tag>;
  };

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => !a.has_review).length,
    completed: assignments.filter((a) => a.has_review).length,
  };

  const columns = [
    {
      title: '参赛编号',
      dataIndex: ['submission', 'submission_number'],
      key: 'submission_number',
      width: 150,
    },
    {
      title: '作品标题',
      dataIndex: ['submission', 'work_title'],
      key: 'work_title',
    },
    {
      title: '竞赛名称',
      dataIndex: ['submission', 'contest', 'name'],
      key: 'contest_name',
    },
    {
      title: '组别',
      dataIndex: ['submission', 'category', 'name'],
      key: 'category_name',
    },
    {
      title: '评审状态',
      key: 'review_status',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: '分配时间',
      dataIndex: 'assigned_at',
      key: 'assigned_at',
      render: (text) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => navigate(`/judge/review/${record.id}`)}>
          {record.has_review ? '查看评审' : '开始评审'}
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Title level={2}>评委中心</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="分配作品总数"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#003d7a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="待评审作品"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已评审作品"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 评审任务列表 */}
      <Card title="评审任务">
        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{ emptyText: '暂无评审任务' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

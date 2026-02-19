import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Button, Typography, List, Tag } from 'antd';
import { TrophyOutlined, FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { contestsAPI } from '../../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length,
    reviewed: submissions.filter((s) => s.status === 'reviewed').length,
  };

  return (
    <div className="page-container">
      <Title level={2}>选手中心</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="参赛作品总数"
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
              value={stats.submitted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已评审作品"
              value={stats.reviewed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col>
            <Button
              type="primary"
              icon={<TrophyOutlined />}
              size="large"
              onClick={() => navigate('/contestant/submit')}
            >
              提交作品
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FileTextOutlined />}
              size="large"
              onClick={() => navigate('/contestant/submissions')}
            >
              查看我的作品
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 最近提交 */}
      <Card title="最近提交">
        <List
          loading={loading}
          dataSource={submissions.slice(0, 5)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <>
                    {item.work_title}
                    <span style={{ marginLeft: 12 }}>{getStatusTag(item.status)}</span>
                  </>
                }
                description={
                  <div>
                    <div>竞赛：{item.contest_name}</div>
                    <div>组别：{item.category_name}</div>
                    <div>提交时间：{item.submitted_at ? new Date(item.submitted_at).toLocaleString('zh-CN') : '-'}</div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无提交记录' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

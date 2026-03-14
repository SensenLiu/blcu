import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Spin, Empty } from 'antd';
import { TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import { contestsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;

const getStatusTag = (status, isOpen) => {
  if (isOpen) {
    return <Tag color="success">报名中</Tag>;
  }

  const statusMap = {
    draft: { text: '草稿', color: 'default' },
    open: { text: '已开放', color: 'processing' },
    reviewing: { text: '评审中', color: 'warning' },
    closed: { text: '已结束', color: 'default' },
  };

  const statusInfo = statusMap[status] || statusMap.draft;
  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
};

const ContestList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const data = await contestsAPI.getContests();
      setContests(data?.results || data || []);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-section">
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          竞赛活动
        </Title>

        {contests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
              borderRadius: 12,
              padding: '60px 40px',
              maxWidth: 560,
              margin: '0 auto',
            }}>
              <TrophyOutlined style={{ fontSize: 64, color: '#003d7a', marginBottom: 24 }} />
              <Title level={3} style={{ color: '#003d7a', marginBottom: 12 }}>
                竞赛即将开启
              </Title>
              <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 0 }}>
                北京语言大学读写研究中心将定期举办读写竞赛活动，欢迎广大师生积极参与。
                <br />请关注本页面，竞赛信息将及时更新。
              </Paragraph>
            </div>
          </div>
        ) : (
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {contests.map((contest) => (
              <Col xs={24} sm={12} lg={8} key={contest.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/contests/${contest.id}`)}
                  style={{ height: '100%' }}
                >
                  <div style={{ marginBottom: 12 }}>
                    {getStatusTag(contest.status, contest.is_open)}
                  </div>

                  <Title level={4} style={{ marginBottom: 12 }}>
                    {contest.name}
                  </Title>

                  <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 16 }}>
                    {contest.description}
                  </Paragraph>

                  <div style={{ color: '#999', fontSize: 14 }}>
                    <div style={{ marginBottom: 8 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      开始：{new Date(contest.start_date).toLocaleDateString('zh-CN')}
                    </div>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      截止：{new Date(contest.submission_deadline).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ContestList;

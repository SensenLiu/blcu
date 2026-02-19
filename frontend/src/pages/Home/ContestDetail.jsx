import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Descriptions, Tag, Alert, Divider } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
import { contestsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isContestant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const data = await contestsAPI.getContest(id);
      setContest(data);
    } catch (error) {
      console.error('Failed to fetch contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/contestant/submit', { state: { contestId: contest.id } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="page-container">
        <div className="content-section" style={{ textAlign: 'center' }}>
          <Title level={3}>竞赛不存在</Title>
          <Button type="primary" onClick={() => navigate('/contests')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-section">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/contests')}
          style={{ marginBottom: 24 }}
        >
          返回列表
        </Button>

        <Title level={1} style={{ marginBottom: 16 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          {contest.name}
        </Title>

        <div style={{ marginBottom: 24 }}>
          {contest.is_open ? (
            <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
              报名中
            </Tag>
          ) : contest.is_submission_closed ? (
            <Tag color="default" style={{ fontSize: 14, padding: '4px 12px' }}>
              已截止
            </Tag>
          ) : (
            <Tag color="processing" style={{ fontSize: 14, padding: '4px 12px' }}>
              {contest.status_display}
            </Tag>
          )}
        </div>

        {contest.is_open && (
          <Alert
            message="竞赛正在报名中"
            description="欢迎参赛选手提交作品！"
            type="success"
            showIcon
            action={
              isContestant && (
                <Button type="primary" onClick={handleSubmit}>
                  提交作品
                </Button>
              )
            }
            style={{ marginBottom: 24 }}
          />
        )}

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="竞赛状态">{contest.status_display}</Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {new Date(contest.start_date).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="提交截止">
            {new Date(contest.submission_deadline).toLocaleString('zh-CN')}
          </Descriptions.Item>
          {contest.review_deadline && (
            <Descriptions.Item label="评审截止">
              {new Date(contest.review_deadline).toLocaleString('zh-CN')}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left">竞赛说明</Divider>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {contest.description}
        </Paragraph>

        {contest.categories && contest.categories.length > 0 && (
          <>
            <Divider orientation="left">竞赛组别</Divider>
            {contest.categories.map((category) => (
              <div key={category.id} style={{ marginBottom: 24 }}>
                <Title level={4}>{category.name}</Title>
                <Paragraph>{category.description}</Paragraph>
                <div style={{ color: '#666' }}>
                  <div>最大文件大小：{category.max_file_size_mb}MB</div>
                  <div>允许格式：{category.allowed_formats}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {contest.is_open && isContestant && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Button type="primary" size="large" onClick={handleSubmit}>
              立即提交作品
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetail;

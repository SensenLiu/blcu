import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Spin, Divider } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { newsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      const data = await newsAPI.getArticles({ page_size: 6 });
      setArticles(data.results || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
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
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)',
          color: 'white',
          padding: '80px 40px',
          borderRadius: 8,
          marginBottom: 40,
          textAlign: 'center',
        }}
      >
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          北京语言大学读写研究中心
        </Title>
        <Paragraph style={{ color: 'white', fontSize: 18, marginBottom: 32 }}>
          致力于提升学生读写能力，促进学术交流与发展
        </Paragraph>
        <Button type="primary" size="large" ghost onClick={() => navigate('/contests')}>
          查看竞赛活动
        </Button>
      </div>

      {/* 最新动态 */}
      <div className="content-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>最新动态</Title>
          <Button type="link" onClick={() => navigate('/news')}>
            查看更多 <RightOutlined />
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} lg={8} key={article.id}>
              <Card
                hoverable
                cover={
                  article.cover_image && (
                    <img
                      alt={article.title}
                      src={article.cover_image}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  )
                }
                onClick={() => navigate(`/news/${article.id}`)}
              >
                <Card.Meta
                  title={article.title}
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                        {article.summary}
                      </Paragraph>
                      <div style={{ color: '#999', fontSize: 12 }}>
                        {new Date(article.publish_date).toLocaleDateString('zh-CN')}
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 中心简介 */}
      <div className="content-section">
        <Title level={2}>中心简介</Title>
        <Divider />
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
          北京语言大学读写研究中心是专注于语言教育研究的学术机构，致力于探索和改进读写教学方法，
          提升学生的语言表达和理解能力。中心定期举办学术竞赛、研讨会和培训活动，
          为广大师生提供交流学习的平台。
        </Paragraph>
      </div>
    </div>
  );
};

export default Home;

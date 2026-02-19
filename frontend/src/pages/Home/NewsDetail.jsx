import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { newsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const data = await newsAPI.getArticle(id);
      setArticle(data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
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

  if (!article) {
    return (
      <div className="page-container">
        <div className="content-section" style={{ textAlign: 'center' }}>
          <Title level={3}>文章不存在</Title>
          <Button type="primary" onClick={() => navigate('/news')}>
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
          onClick={() => navigate('/news')}
          style={{ marginBottom: 24 }}
        >
          返回列表
        </Button>

        <Title level={1} style={{ marginBottom: 16 }}>
          {article.title}
        </Title>

        <div style={{ marginBottom: 24, color: '#999' }}>
          <Tag color="blue">{article.category_display}</Tag>
          <CalendarOutlined style={{ marginLeft: 16, marginRight: 8 }} />
          {new Date(article.publish_date).toLocaleDateString('zh-CN')}
          <EyeOutlined style={{ marginLeft: 24, marginRight: 8 }} />
          {article.view_count} 次浏览
        </div>

        {article.cover_image && (
          <img
            alt={article.title}
            src={article.cover_image}
            style={{
              width: '100%',
              maxHeight: 500,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 24,
            }}
          />
        )}

        {article.summary && (
          <>
            <Paragraph
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              {article.summary}
            </Paragraph>
            <Divider />
          </>
        )}

        <div
          style={{ fontSize: 16, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
        />

        <Divider />

        {article.author && (
          <div style={{ color: '#999' }}>
            作者：{article.author.full_name || article.author.username}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;

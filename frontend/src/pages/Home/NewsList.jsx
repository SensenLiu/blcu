import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Typography, Spin, Pagination, Tabs, Input } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { newsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const NewsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [currentCategory, searchKeyword, pagination.current]);

  const fetchCategories = async () => {
    try {
      const data = await newsAPI.getCategories();
      setCategories([{ value: '', label: '全部' }, ...data]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      if (currentCategory) params.category = currentCategory;
      if (searchKeyword) params.search = searchKeyword;

      const data = await newsAPI.getArticles(params);
      setArticles(data.results || []);
      setPagination((prev) => ({ ...prev, total: data.count || 0 }));
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const tabItems = categories.map((cat) => ({
    key: cat.value,
    label: cat.label,
  }));

  return (
    <div className="page-container">
      <div className="content-section">
        <Title level={2}>新闻动态</Title>

        <Search
          placeholder="搜索新闻..."
          allowClear
          enterButton="搜索"
          size="large"
          onSearch={handleSearch}
          style={{ marginBottom: 24 }}
        />

        <Tabs
          items={tabItems}
          onChange={handleCategoryChange}
          style={{ marginBottom: 24 }}
        />

        <Spin spinning={loading}>
          <List
            dataSource={articles}
            renderItem={(article) => (
              <List.Item
                key={article.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/news/${article.id}`)}
              >
                <Card hoverable style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {article.cover_image && (
                      <img
                        alt={article.title}
                        src={article.cover_image}
                        style={{
                          width: 200,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ marginBottom: 12 }}>
                        {article.title}
                      </Title>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                        {article.summary}
                      </Paragraph>
                      <div style={{ color: '#999', fontSize: 14 }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        {new Date(article.publish_date).toLocaleDateString('zh-CN')}
                        <EyeOutlined style={{ marginLeft: 24, marginRight: 8 }} />
                        {article.view_count} 次浏览
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default NewsList;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Select, Upload, Button, Card, Typography, message, Alert } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { contestsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const SubmitWork = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contests, setContests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fileList, setFileList] = useState([]);

  const preSelectedContestId = location.state?.contestId;

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (preSelectedContestId) {
      form.setFieldsValue({ contest: parseInt(preSelectedContestId) });
      handleContestChange(parseInt(preSelectedContestId));
    }
  }, [preSelectedContestId, contests]);

  const fetchContests = async () => {
    try {
      const data = await contestsAPI.getContests();
      const openContests = data.filter((c) => c.is_open);
      setContests(openContests);
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    }
  };

  const handleContestChange = async (contestId) => {
    const contest = contests.find((c) => c.id === contestId);
    setSelectedContest(contest);
    form.setFieldsValue({ category: undefined });
    setSelectedCategory(null);
    setFileList([]);

    try {
      const data = await contestsAPI.getCategories(contestId);
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    setSelectedCategory(category);
    setFileList([]);
  };

  const beforeUpload = (file) => {
    if (!selectedCategory) {
      message.error('请先选择竞赛组别');
      return false;
    }

    // 检查文件格式
    const fileExt = file.name.split('.').pop().toLowerCase();
    const allowedFormats = selectedCategory.allowed_formats_list || [];

    if (!allowedFormats.includes(fileExt)) {
      message.error(`不支持的文件格式。允许的格式：${selectedCategory.allowed_formats}`);
      return false;
    }

    // 检查文件大小
    const maxSize = selectedCategory.max_file_size_mb * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(`文件过大，最大允许 ${selectedCategory.max_file_size_mb}MB`);
      return false;
    }

    setFileList([file]);
    return false; // 阻止自动上传
  };

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('请上传作品文件');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        contest: values.contest,
        category: values.category,
        work_title: values.work_title,
        work_description: values.work_description || '',
        file: fileList[0],
      };

      await contestsAPI.submitWork(formData);
      message.success('作品提交成功！');
      navigate('/contestant/submissions');
    } catch (error) {
      console.error('Failed to submit work:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Card>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/contestant')}
          style={{ marginBottom: 16 }}
        >
          返回选手中心
        </Button>

        <Title level={2}>提交作品</Title>

        <Alert
          message="提交须知"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>请仔细选择竞赛和组别，提交后不可修改</li>
              <li>作品文件必须符合格式和大小要求</li>
              <li>作品标题应简洁明了，准确反映作品内容</li>
              <li>提交成功后将生成唯一的参赛编号</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label="选择竞赛"
            name="contest"
            rules={[{ required: true, message: '请选择竞赛' }]}
          >
            <Select
              placeholder="请选择竞赛"
              onChange={handleContestChange}
              options={contests.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="选择组别"
            name="category"
            rules={[{ required: true, message: '请选择组别' }]}
          >
            <Select
              placeholder="请先选择竞赛"
              onChange={handleCategoryChange}
              disabled={!selectedContest}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </Form.Item>

          {selectedCategory && (
            <Alert
              message={`${selectedCategory.name} - 文件要求`}
              description={
                <>
                  <div>最大文件大小：{selectedCategory.max_file_size_mb}MB</div>
                  <div>允许的格式：{selectedCategory.allowed_formats}</div>
                </>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="作品标题"
            name="work_title"
            rules={[{ required: true, message: '请输入作品标题' }]}
          >
            <Input placeholder="请输入作品标题" />
          </Form.Item>

          <Form.Item label="作品说明" name="work_description">
            <TextArea rows={4} placeholder="请简要介绍您的作品（选填）" />
          </Form.Item>

          <Form.Item label="作品文件" required>
            <Upload
              beforeUpload={beforeUpload}
              onRemove={() => setFileList([])}
              fileList={fileList}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} disabled={!selectedCategory}>
                选择文件
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              提交作品
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SubmitWork;

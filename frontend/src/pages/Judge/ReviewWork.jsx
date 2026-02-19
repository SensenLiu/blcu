import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Form,
  InputNumber,
  Input,
  Button,
  Typography,
  Spin,
  message,
  Divider,
  Alert,
  Space,
} from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { reviewsAPI, contestsAPI } from '../../services/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewWork = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      // 获取评审分配信息
      const assignmentData = await reviewsAPI.getAssignment(assignmentId);
      setAssignment(assignmentData);

      // 获取评分维度
      const dimensionsData = await reviewsAPI.getScoreDimensions(
        assignmentData.submission.contest.id
      );
      setDimensions(dimensionsData || []);

      // 获取已有评审
      try {
        const reviewData = await reviewsAPI.getMyReview(assignmentId);
        setExistingReview(reviewData);

        // 填充表单
        const scoresObj = {};
        reviewData.scores.forEach((score) => {
          scoresObj[`score_${score.dimension}`] = score.score;
        });
        form.setFieldsValue({
          ...scoresObj,
          comment: reviewData.comment,
        });
      } catch (error) {
        // 没有评审记录
        console.log('No existing review');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await contestsAPI.downloadFile(assignment.submission.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', assignment.submission.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      message.error('下载失败');
    }
  };

  const onFinish = async (values) => {
    const scores = dimensions.map((dim) => ({
      dimension: dim.id,
      score: values[`score_${dim.id}`],
    }));

    const data = {
      assignment_id: parseInt(assignmentId),
      scores,
      comment: values.comment || '',
    };

    setSubmitting(true);
    try {
      if (existingReview) {
        await reviewsAPI.updateReview(assignmentId, data);
        message.success('评审更新成功！');
      } else {
        await reviewsAPI.submitReview(data);
        message.success('评审提交成功！');
      }
      navigate('/judge');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="page-container">
        <Card>
          <Title level={3}>评审任务不存在</Title>
          <Button type="primary" onClick={() => navigate('/judge')}>
            返回评委中心
          </Button>
        </Card>
      </div>
    );
  }

  const { submission } = assignment;

  return (
    <div className="page-container">
      <Card>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/judge')}
          style={{ marginBottom: 16 }}
        >
          返回评委中心
        </Button>

        <Title level={2}>作品评审</Title>

        {existingReview && (
          <Alert
            message="您已提交过评审"
            description="您可以修改评分和评审意见，修改后将覆盖之前的评审"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* 作品信息 */}
        <Card title="作品信息" style={{ marginBottom: 24 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="参赛编号">{submission.submission_number}</Descriptions.Item>
            <Descriptions.Item label="作品标题">{submission.work_title}</Descriptions.Item>
            <Descriptions.Item label="竞赛名称">{submission.contest.name}</Descriptions.Item>
            <Descriptions.Item label="参赛组别">{submission.category.name}</Descriptions.Item>
            <Descriptions.Item label="选手姓名">{submission.contestant_name}</Descriptions.Item>
            <Descriptions.Item label="作品说明">
              {submission.work_description || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="作品文件">
              <Space>
                <span>{submission.file_name}</span>
                <Button
                  type="primary"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载
                </Button>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 评分表单 */}
        <Card title="评审打分">
          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            {dimensions.map((dim) => (
              <Form.Item
                key={dim.id}
                label={
                  <span>
                    {dim.name}
                    {dim.description && (
                      <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 14 }}>
                        {dim.description}
                      </Paragraph>
                    )}
                  </span>
                }
                name={`score_${dim.id}`}
                rules={[
                  { required: true, message: `请为"${dim.name}"评分` },
                  {
                    type: 'number',
                    min: 0,
                    max: dim.max_score,
                    message: `分数范围：0 - ${dim.max_score}`,
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={dim.max_score}
                  step={0.5}
                  precision={1}
                  style={{ width: 200 }}
                  addonAfter={`/ ${dim.max_score}分`}
                />
              </Form.Item>
            ))}

            <Divider />

            <Form.Item label="评审意见" name="comment">
              <TextArea
                rows={6}
                placeholder="请输入您的评审意见和建议（选填）"
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting} size="large">
                  {existingReview ? '更新评审' : '提交评审'}
                </Button>
                <Button onClick={() => navigate('/judge')} size="large">
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default ReviewWork;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Statistic, Empty, Spin, Space, Divider } from 'antd';
import { BulbOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { AppLayout } from '@/components/Layout';
import { useIdeas, useActivity, useAuth } from '@/hooks';
import { NotificationService } from '@/services/NotificationService';
import { improvingColors } from '@/theme/colors';
import { IdeaStatus } from '@/types';
import type { Idea } from '@/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { ideas, getTrendingIdeas } = useIdeas();
  const { activeUsers } = useActivity();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await getTrendingIdeas(6);
      } catch {
        NotificationService.error('Failed to load ideas');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getTrendingIdeas]);

  const stats = {
    totalIdeas: ideas.length,
    approvedIdeas: ideas.filter((i: Idea) => i.status === IdeaStatus.Approved).length,
    activeUsers: activeUsers.length,
  };

  const handleCreateIdea = () => {
    if (!isAuthenticated) {
      NotificationService.warning('Login required');
      navigate('/login');
      return;
    }
    navigate('/ideas/create');
  };

  return (
    <AppLayout>
      <div style={{
        background: `linear-gradient(135deg, ${improvingColors.primaryBlue} 0%, ${improvingColors.teal} 100%)`,
        borderRadius: '8px',
        padding: '64px 48px',
        marginBottom: '48px',
        color: '#ffffff',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 700, margin: '0 0 16px 0' }}>
          Welcome to Catalyst
        </h1>
        <p style={{ fontSize: '18px', margin: '0 0 32px 0' }}>
          A collaborative platform for innovative ideas
        </p>
        <Space>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateIdea}
            style={{
              backgroundColor: '#ffffff',
              color: improvingColors.primaryBlue,
              fontWeight: 600,
              height: '44px',
              paddingInline: '32px',
            }}
          >
            Create New Idea
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/ideas')}
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              borderColor: '#ffffff',
              fontWeight: 600,
              height: '44px',
            }}
          >
            Browse Ideas
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '8px', border: `1px solid ${improvingColors.gray300}` }}>
            <Statistic
              title="Total Ideas"
              value={stats.totalIdeas}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '8px', border: `1px solid ${improvingColors.gray300}` }}>
            <Statistic
              title="Approved Ideas"
              value={stats.approvedIdeas}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '8px', border: `1px solid ${improvingColors.gray300}` }}>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '48px 0' }} />
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>
        Trending Ideas
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size="large" />
        </div>
      ) : ideas.length === 0 ? (
        <Empty description="No ideas yet">
          <Button type="primary" onClick={handleCreateIdea}>
            Submit Your First Idea
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {ideas.map((idea: Idea) => (
            <Col key={idea.id} xs={24} sm={12} lg={8}>
              <Card
                hoverable
                onClick={() => navigate(`/ideas/${idea.id}`)}
                style={{ borderRadius: '8px', cursor: 'pointer' }}
              >
                <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '12px' }}>
                  {idea.title}
                </h3>
                <p style={{ color: improvingColors.gray500, marginBottom: '12px' }}>
                  {idea.description.substring(0, 100)}...
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: `1px solid ${improvingColors.gray200}`,
                  paddingTop: '12px',
                }}>
                  <span>{idea.commentCount || 0} comments</span>
                  <span style={{ fontWeight: 600, color: improvingColors.primaryBlue }}>
                    {idea.status}
                  </span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {isAuthenticated && (
        <>
          <Divider style={{ margin: '48px 0' }} />
          <div style={{
            background: improvingColors.lightGray,
            borderRadius: '8px',
            padding: '48px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
              Have an idea?
            </h2>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateIdea}
              style={{
                backgroundColor: improvingColors.primaryBlue,
                fontWeight: 600,
                height: '44px',
              }}
            >
              Submit Your Idea
            </Button>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default HomePage;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/api';

function Profile() {
  const { username } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchUserContent();
  }, [username]);

  const fetchUserContent = async () => {
    try {
      // Fetch all posts and filter by username
      const postsRes = await fetch(`${API_URL}/posts`);
      const posts = await postsRes.json();
      setUserPosts(posts.filter(p => p.username === username));
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = Math.floor((now - posted) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="main-layout">
      <div className="content-area">
        <div style={{ background: '#fff', borderRadius: '4px', marginBottom: '16px', border: '1px solid #ccc' }}>
          <div style={{ 
            height: '100px', 
            background: 'linear-gradient(to right, #0079d3, #ff4500)',
            borderRadius: '4px 4px 0 0'
          }} />
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#0079d3',
              marginTop: '-40px',
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '32px',
              fontWeight: 700
            }}>
              {username[0].toUpperCase()}
            </div>
            <h1 style={{ margin: '12px 0 4px', fontSize: '28px' }}>u/{username}</h1>
            <p style={{ color: '#787c7e', fontSize: '14px' }}>User since 2024</p>
          </div>
        </div>

        <div className="sort-bar">
          <button 
            className={`sort-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={`sort-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
        </div>

        {activeTab === 'posts' && userPosts.map(post => (
          <div key={post.id} className="post-card">
            <div className="voting-section">
              <button className="vote-btn">▲</button>
              <span className="vote-count">{post.score}</span>
              <button className="vote-btn">▼</button>
            </div>
            <div className="post-content-wrapper">
              <div className="post-header">
                <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
                {' • '}
                <span>{formatTime(post.created_at)}</span>
              </div>
              <h3 className="post-title">
                <Link to={`/post/${post.id}`}>{post.title}</Link>
              </h3>
              {post.content && (
                <div className="post-body">{post.content.substring(0, 200)}...</div>
              )}
            </div>
          </div>
        ))}

        {activeTab === 'comments' && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#787c7e' }}>
            No comments yet
          </div>
        )}
      </div>

      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header">About</div>
          <div style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#787c7e' }}>Post Karma</span>
              <span style={{ fontWeight: 600 }}>{userPosts.reduce((acc, p) => acc + p.score, 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#787c7e' }}>Comment Karma</span>
              <span style={{ fontWeight: 600 }}>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

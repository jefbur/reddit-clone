import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function Home() {
  const [posts, setPosts] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const [sortBy, setSortBy] = useState('hot');
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchSubreddits();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      
      // Sort posts based on selection
      let sorted = data;
      if (sortBy === 'new') {
        sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortBy === 'top') {
        sorted = data.sort((a, b) => b.score - a.score);
      } else {
        // hot - combination of score and recency
        sorted = data.sort((a, b) => b.score - a.score);
      }
      
      setPosts(sorted);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSubreddits = async () => {
    try {
      const response = await fetch(`${API_URL}/subreddits`);
      const data = await response.json();
      setSubreddits(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching subreddits:', error);
    }
  };

  const handleVote = async (postId, voteType, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await fetch(`${API_URL}/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });
      fetchPosts();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatScore = (score) => {
    if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'k';
    }
    return score;
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
        {/* Create Post Box */}
        <div className="create-post-box">
          <div className="user-avatar">
            {isAuthenticated ? user?.username?.[0]?.toUpperCase() : '?'}
          </div>
          <div 
            className="create-post-input"
            onClick={() => navigate('/create')}
            style={{ cursor: 'pointer' }}
          >
            Create Post
          </div>
        </div>

        {/* Sort Bar */}
        <div className="sort-bar">
          <button 
            className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`}
            onClick={() => setSortBy('hot')}
          >
            🔥 Hot
          </button>
          <button 
            className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`}
            onClick={() => setSortBy('new')}
          >
            ✨ New
          </button>
          <button 
            className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`}
            onClick={() => setSortBy('top')}
          >
            📈 Top
          </button>
        </div>

        {/* Posts */}
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="voting-section">
              <button 
                className="vote-btn"
                onClick={(e) => handleVote(post.id, 1, e)}
              >
                ▲
              </button>
              <span className="vote-count">{formatScore(post.score)}</span>
              <button 
                className="vote-btn"
                onClick={(e) => handleVote(post.id, -1, e)}
              >
                ▼
              </button>
            </div>
            <div className="post-content-wrapper">
              <div className="post-header">
                <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
                {' • '}
                <span>Posted by </span>
                <Link to={`/user/${post.username}`}>u/{post.username}</Link>
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
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header" style={{ background: 'linear-gradient(to right, #ff4500, #ff8717)' }}>
            Home
          </div>
          <div style={{ padding: '12px' }}>
            <p style={{ fontSize: '14px', color: '#1a1a1b', marginBottom: '12px' }}>
              Your personal Reddit frontpage. Come here to check in with your favorite communities.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/create')}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              Create Post
            </button>
            <button 
              className="btn" 
              style={{ width: '100%', background: '#fff', color: '#0079d3', border: '1px solid #0079d3' }}
            >
              Create Community
            </button>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-header">
            Top Communities
          </div>
          <div>
            {subreddits.map((sub, index) => (
              <div key={sub.id} className="sidebar-item">
                <span style={{ color: '#0079d3', fontWeight: 700, marginRight: '12px', width: '20px' }}>
                  {index + 1}
                </span>
                <div className="community-icon">
                  {sub.name[0].toUpperCase()}
                </div>
                <div className="community-info">
                  <div className="community-name">r/{sub.name}</div>
                  <div className="community-members">{Math.floor(Math.random() * 1000)}k members</div>
                </div>
                <button className="join-btn">Join</button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-card">
          <div style={{ padding: '12px', fontSize: '12px', color: '#787c7e' }}>
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>About</Link>
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>Careers</Link>
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>Press</Link>
            <br /><br />
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>Advertise</Link>
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>Blog</Link>
            <Link to="/" style={{ color: '#787c7e', textDecoration: 'none', marginRight: '8px' }}>Help</Link>
            <br /><br />
            Reddit Clone © 2024
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

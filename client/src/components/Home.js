import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function Home() {
  const [posts, setPosts] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchSubreddits();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSubreddits = async () => {
    try {
      const response = await fetch(`${API_URL}/subreddits`);
      const data = await response.json();
      setSubreddits(data);
    } catch (error) {
      console.error('Error fetching subreddits:', error);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!token) {
      alert('Please login to vote');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });
      
      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="container">
      <div className="subreddit-list">
        <h3>Subreddits</h3>
        {subreddits.map(sub => (
          <Link key={sub.id} to={`/r/${sub.name}`} className="subreddit-tag">
            r/{sub.name}
          </Link>
        ))}
      </div>
      
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="voting-section">
            <button className="vote-btn" onClick={() => handleVote(post.id, 1)}>▲</button>
            <span className="vote-count">{post.score}</span>
            <button className="vote-btn" onClick={() => handleVote(post.id, -1)}>▼</button>
          </div>
          <div className="post-content">
            <h3 className="post-title">
              <Link to={`/post/${post.id}`}>{post.title}</Link>
            </h3>
            <div className="post-meta">
              Posted by <span className="comment-author">{post.username}</span> in{' '}
              <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
            </div>
            {post.content && (
              <div className="post-body">{post.content.substring(0, 200)}...</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;

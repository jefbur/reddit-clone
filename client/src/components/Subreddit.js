import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function Subreddit() {
  const { name } = useParams();
  const [posts, setPosts] = useState([]);
  const [subreddit, setSubreddit] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchSubreddit();
  }, [name]);

  const fetchSubreddit = async () => {
    try {
      // Get all subreddits to find this one
      const subResponse = await fetch(`${API_URL}/subreddits`);
      const subs = await subResponse.json();
      const currentSub = subs.find(s => s.name === name);
      setSubreddit(currentSub);

      if (currentSub) {
        // Get all posts and filter by subreddit
        const postsResponse = await fetch(`${API_URL}/posts`);
        const allPosts = await postsResponse.json();
        const filteredPosts = allPosts.filter(p => p.subreddit_id === currentSub.id);
        setPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error fetching subreddit:', error);
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
        fetchSubreddit();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!subreddit) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="create-post-form">
        <h1>r/{subreddit.name}</h1>
        <p>{subreddit.description}</p>
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
              Posted by <span className="comment-author">{post.username}</span>
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

export default Subreddit;

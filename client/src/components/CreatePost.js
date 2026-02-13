import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

function CreatePost() {
  const [formData, setFormData] = useState({ title: '', content: '', subreddit_id: '' });
  const [subreddits, setSubreddits] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSubreddits();
  }, [isAuthenticated, navigate]);

  const fetchSubreddits = async () => {
    try {
      const response = await fetch(`${API_URL}/subreddits`);
      const data = await response.json();
      setSubreddits(data);
    } catch (error) {
      console.error('Error fetching subreddits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <div className="create-post-form">
        <h2>Create a Post</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Enter post title"
            />
          </div>
          <div className="form-group">
            <label>Subreddit</label>
            <select
              value={formData.subreddit_id}
              onChange={(e) => setFormData({...formData, subreddit_id: e.target.value})}
              required
            >
              <option value="">Select a subreddit</option>
              {subreddits.map(sub => (
                <option key={sub.id} value={sub.id}>r/{sub.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows="6"
              placeholder="What are your thoughts?"
            />
          </div>
          <button type="submit" className="btn">Post</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

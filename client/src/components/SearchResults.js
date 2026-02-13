import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
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
        <div style={{ background: '#fff', padding: '16px', borderRadius: '4px', marginBottom: '16px', border: '1px solid #ccc' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            Search results for "{searchTerm}"
          </h2>
          <p style={{ color: '#787c7e', margin: '8px 0 0 0' }}>
            {results.length} results found
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Searching...</div>
        ) : results.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc' }}>
            <p style={{ color: '#787c7e' }}>No results found for "{searchTerm}"</p>
          </div>
        ) : (
          results.map(post => (
            <div key={post.id} className="post-card">
              <div className="voting-section">
                <button className="vote-btn">▲</button>
                <span className="vote-count">{post.score}</span>
                <button className="vote-btn">▼</button>
              </div>
              <div className="post-content-wrapper">
                <div className="post-header">
                  <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
                  {' • Posted by '}
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
          ))
        )}
      </div>

      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header">Search Tips</div>
          <div style={{ padding: '12px', fontSize: '14px', color: '#1a1a1b' }}>
            <p style={{ margin: '0 0 12px 0' }}>Search for posts by:</p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#787c7e' }}>
              <li>Title keywords</li>
              <li>Post content</li>
              <li>Author username</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;

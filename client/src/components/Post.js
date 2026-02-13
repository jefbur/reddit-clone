import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`);
      const data = await response.json();
      setPost(data);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchPost();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });
      
      if (response.ok) {
        fetchPost();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!post) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="post-card">
        <div className="voting-section">
          <button className="vote-btn" onClick={() => handleVote(1)}>▲</button>
          <span className="vote-count">{post.score}</span>
          <button className="vote-btn" onClick={() => handleVote(-1)}>▼</button>
        </div>
        <div className="post-content">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            Posted by <span className="comment-author">{post.username}</span> in{' '}
            <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
          </div>
          {post.content && (
            <div className="post-body">{post.content}</div>
          )}
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows="4"
                required
              />
            </div>
            <button type="submit" className="btn">Comment</button>
          </form>
        ) : (
          <p><Link to="/login">Login</Link> to post a comment</p>
        )}

        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-meta">
              <span className="comment-author">{comment.username}</span> • {new Date(comment.created_at).toLocaleDateString()}
            </div>
            <div className="comment-body">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Post;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuth();

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`);
      const data = await response.json();
      setPost(data);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment,
          parent_id: replyTo 
        })
      });
      setNewComment('');
      setReplyTo(null);
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await fetch(`${API_URL}/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vote_type: voteType })
      });
      fetchPost();
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

  // Organize comments into nested structure
  const organizeComments = (comments) => {
    const commentMap = {};
    const rootComments = [];
    
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    
    comments.forEach(comment => {
      if (comment.parent_id) {
        if (commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });
    
    return rootComments;
  };

  const Comment = ({ comment, depth = 0 }) => (
    <div style={{ 
      marginLeft: depth > 0 ? '24px' : '0',
      borderLeft: depth > 0 ? '2px solid #edeff1' : 'none',
      paddingLeft: depth > 0 ? '12px' : '0',
      marginBottom: '16px'
    }}>
      <div style={{ fontSize: '12px', color: '#787c7e', marginBottom: '4px' }}>
        <Link to={`/user/${comment.username}`} style={{ color: '#1a1a1b', fontWeight: 600, textDecoration: 'none' }}>
          {comment.username}
        </Link>
        <span> • {formatTime(comment.created_at)}</span>
      </div>
      <div style={{ color: '#1a1a1b', lineHeight: '1.5', marginBottom: '8px' }}>
        {comment.content}
      </div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600, color: '#878a8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => setReplyTo(comment.id)}>Reply</span>
        <span>Share</span>
        <span>Save</span>
      </div>
      
      {replyTo === comment.id && (
        <form onSubmit={handleSubmitComment} style={{ marginTop: '12px' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Reply to ${comment.username}...`}
            rows="3"
            style={{ width: '100%', padding: '8px', border: '1px solid #edeff1', borderRadius: '4px' }}
          />
          <div style={{ marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', marginRight: '8px' }}>
              Reply
            </button>
            <button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="btn"
              style={{ width: 'auto', background: '#edeff1', color: '#1a1a1b' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {comment.replies && comment.replies.map(reply => (
        <Comment key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );

  if (!post) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const nestedComments = organizeComments(comments);

  return (
    <div className="main-layout">
      <div className="content-area">
        <div className="post-card">
          <div className="voting-section">
            <button className="vote-btn" onClick={() => handleVote(1)}>▲</button>
            <span className="vote-count">{formatScore(post.score)}</span>
            <button className="vote-btn" onClick={() => handleVote(-1)}>▼</button>
          </div>
          <div className="post-content-wrapper">
            <div className="post-header">
              <Link to={`/r/${post.subreddit_name}`}>r/{post.subreddit_name}</Link>
              {' • Posted by '}
              <Link to={`/user/${post.username}`}>u/{post.username}</Link>
              {' • '}
              <span>{formatTime(post.created_at)}</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 500, margin: '8px 0' }}>{post.title}</h1>
            {post.content && (
              <div style={{ color: '#1a1a1b', lineHeight: '1.6', fontSize: '14px' }}>
                {post.content}
              </div>
            )}
          </div>
        </div>

        <div className="comments-section">
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
            {comments.length} Comments
          </div>
          
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} style={{ marginBottom: '24px' }}>
              <div className="user-avatar" style={{ marginBottom: '8px' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows="5"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #edeff1', 
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                  Comment
                </button>
              </div>
            </form>
          ) : (
            <div style={{ background: '#f6f7f8', padding: '16px', borderRadius: '4px', marginBottom: '24px', textAlign: 'center' }}>
              <Link to="/login" style={{ color: '#0079d3', fontWeight: 600 }}>Log in</Link>
              {' or '}
              <Link to="/register" style={{ color: '#0079d3', fontWeight: 600 }}>sign up</Link>
              {' to leave a comment'}
            </div>
          )}

          <div>
            {nestedComments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-card">
          <div className="sidebar-header" style={{ background: '#0079d3' }}>
            About Community
          </div>
          <div style={{ padding: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>r/{post.subreddit_name}</h3>
            <p style={{ fontSize: '14px', color: '#787c7e', marginBottom: '12px' }}>
              A community for discussion and sharing.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>12.5k</div>
                <div style={{ color: '#787c7e', fontSize: '12px' }}>Members</div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>245</div>
                <div style={{ color: '#787c7e', fontSize: '12px' }}>Online</div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;

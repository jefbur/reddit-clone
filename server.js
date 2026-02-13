const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new sqlite3.Database('./reddit.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS subreddits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    user_id INTEGER NOT NULL,
    subreddit_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subreddit_id) REFERENCES subreddits(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER,
    comment_id INTEGER,
    vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id)
  )`);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
    [username, email, hashedPassword], 
    function(err) {
      if (err) return res.status(400).json({ error: 'User already exists' });
      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
      res.json({ token, user: { id: this.lastID, username, email } });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Get all subreddits
app.get('/api/subreddits', (req, res) => {
  db.all('SELECT * FROM subreddits ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create subreddit
app.post('/api/subreddits', authenticateToken, (req, res) => {
  const { name, description } = req.body;
  db.run('INSERT INTO subreddits (name, description) VALUES (?, ?)', 
    [name, description], 
    function(err) {
      if (err) return res.status(400).json({ error: 'Subreddit already exists' });
      res.json({ id: this.lastID, name, description });
    }
  );
});

// Get posts feed
app.get('/api/posts', (req, res) => {
  const query = `
    SELECT posts.*, users.username, subreddits.name as subreddit_name,
           (posts.upvotes - posts.downvotes) as score
    FROM posts 
    JOIN users ON posts.user_id = users.id
    JOIN subreddits ON posts.subreddit_id = subreddits.id
    ORDER BY score DESC, created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create post
app.post('/api/posts', authenticateToken, (req, res) => {
  const { title, content, subreddit_id } = req.body;
  db.run('INSERT INTO posts (title, content, user_id, subreddit_id) VALUES (?, ?, ?, ?)',
    [title, content, req.user.id, subreddit_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, content, user_id: req.user.id, subreddit_id });
    }
  );
});

// Vote on post
app.post('/api/posts/:id/vote', authenticateToken, (req, res) => {
  const { vote_type } = req.body; // 1 or -1
  const postId = req.params.id;
  
  // Check if user already voted
  db.get('SELECT * FROM votes WHERE user_id = ? AND post_id = ?', 
    [req.user.id, postId], 
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (row) {
        // Update existing vote
        db.run('UPDATE votes SET vote_type = ? WHERE id = ?', [vote_type, row.id]);
        db.run('UPDATE posts SET upvotes = upvotes + ?, downvotes = downvotes + ? WHERE id = ?',
          [vote_type === 1 ? 1 : 0, vote_type === -1 ? 1 : 0, postId]);
      } else {
        // New vote
        db.run('INSERT INTO votes (user_id, post_id, vote_type) VALUES (?, ?, ?)',
          [req.user.id, postId, vote_type]);
        db.run('UPDATE posts SET upvotes = upvotes + ?, downvotes = downvotes + ? WHERE id = ?',
          [vote_type === 1 ? 1 : 0, vote_type === -1 ? 1 : 0, postId]);
      }
      res.json({ success: true });
    }
  );
});

// Get single post with comments
app.get('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  
  db.get(`
    SELECT posts.*, users.username, subreddits.name as subreddit_name,
           (posts.upvotes - posts.downvotes) as score
    FROM posts 
    JOIN users ON posts.user_id = users.id
    JOIN subreddits ON posts.subreddit_id = subreddits.id
    WHERE posts.id = ?
  `, [postId], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Get comments
    db.all(`
      SELECT comments.*, users.username,
             (comments.upvotes - comments.downvotes) as score
      FROM comments 
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY score DESC, created_at DESC
    `, [postId], (err, comments) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...post, comments });
    });
  });
});

// Create comment
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const { content, parent_id } = req.body;
  const postId = req.params.id;
  
  db.run('INSERT INTO comments (content, user_id, post_id, parent_id) VALUES (?, ?, ?, ?)',
    [content, req.user.id, postId, parent_id || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, content, user_id: req.user.id, post_id: postId, parent_id });
    }
  );
});

// Search posts
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  db.all(`
    SELECT posts.*, users.username, subreddits.name as subreddit_name
    FROM posts 
    JOIN users ON posts.user_id = users.id
    JOIN subreddits ON posts.subreddit_id = subreddits.id
    WHERE posts.title LIKE ? OR posts.content LIKE ?
    ORDER BY created_at DESC
  `, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Post from './components/Post';
import Login from './components/Login';
import Register from './components/Register';
import CreatePost from './components/CreatePost';
import Subreddit from './components/Subreddit';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <Link to="/" className="logo">RedditClone</Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/create">Create Post</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/r/:name" element={<Subreddit />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

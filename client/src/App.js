import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Post from './components/Post';
import Login from './components/Login';
import Register from './components/Register';
import CreatePost from './components/CreatePost';
import Subreddit from './components/Subreddit';
import Profile from './components/Profile';
import SearchResults from './components/SearchResults';
import { AuthProvider, useAuth } from './context/AuthContext';

function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <span className="logo-icon">●</span>
          RedditClone
        </Link>
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search Reddit"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <div className="user-avatar">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ color: '#1a1a1b', fontSize: '14px' }}>{user?.username}</span>
            <button onClick={logout} className="nav-btn nav-btn-secondary">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-btn-secondary">Log In</Link>
            <Link to="/register" className="nav-btn nav-btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/r/:name" element={<Subreddit />} />
            <Route path="/user/:username" element={<Profile />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

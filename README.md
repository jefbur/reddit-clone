# Reddit Clone

A full-stack Reddit clone built with React, Node.js/Express, and SQLite.

## Features

- ✅ User authentication (register/login with JWT)
- ✅ Create and browse subreddits
- ✅ Create posts with title and content
- ✅ Comment on posts
- ✅ Upvote/downvote posts and comments
- ✅ Real-time voting score calculation
- ✅ Responsive design inspired by Reddit's UI

## Tech Stack

- **Frontend:** React, React Router, CSS3
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT (JSON Web Tokens), bcryptjs

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jefbur/reddit-clone.git
cd reddit-clone
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

1. Start the backend server:
```bash
npm start
```
The server will run on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd client
npm start
```
The React app will run on http://localhost:3000

3. Open your browser and go to http://localhost:3000

### Default Data

The application automatically creates the database schema on first run. You can create subreddits and posts through the UI.

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Subreddits
- `GET /api/subreddits` - Get all subreddits
- `POST /api/subreddits` - Create new subreddit (auth required)

### Posts
- `GET /api/posts` - Get all posts (sorted by score)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create new post (auth required)
- `POST /api/posts/:id/vote` - Vote on post (auth required)

### Comments
- `POST /api/posts/:id/comments` - Create comment (auth required)

### Search
- `GET /api/search?q=query` - Search posts

## Project Structure

```
reddit-clone/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       ├── context/        # Auth context
│       ├── App.js
│       └── App.css
├── server.js               # Express backend
├── package.json
└── .env                    # Environment variables
```

## License

MIT

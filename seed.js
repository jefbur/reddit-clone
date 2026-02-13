const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./reddit.db');

async function seed() {
  console.log('Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  db.serialize(() => {
    // Insert test user
    db.run(`INSERT OR IGNORE INTO users (id, username, email, password) VALUES (1, 'testuser', 'test@example.com', ?)`, [hashedPassword]);
    
    // Insert subreddits
    db.run(`INSERT OR IGNORE INTO subreddits (id, name, description) VALUES 
      (1, 'technology', 'All about technology and gadgets'),
      (2, 'programming', 'For programmers and developers'),
      (3, 'funny', 'Things that make you laugh'),
      (4, 'askreddit', 'Ask the community anything')`);
    
    // Insert posts
    db.run(`INSERT OR IGNORE INTO posts (id, title, content, user_id, subreddit_id, upvotes, downvotes) VALUES 
      (1, 'What is the best programming language to learn in 2024?', 'I am looking to start coding and wondering what language would be best for beginners. Any suggestions?', 1, 2, 42, 3),
      (2, 'Just built my first React app!', 'After months of learning, I finally created my first React application. It is a simple todo app but I am proud of it!', 1, 1, 128, 5),
      (3, 'Why do programmers prefer dark mode?', 'Because light attracts bugs! 😄', 1, 3, 256, 12),
      (4, 'What is the most useful skill you have learned?', 'Could be professional or personal. What skill has made the biggest impact on your life?', 1, 4, 89, 2)`);
    
    // Insert comments
    db.run(`INSERT OR IGNORE INTO comments (id, content, user_id, post_id, upvotes, downvotes) VALUES 
      (1, 'Python is great for beginners! Easy syntax and huge community.', 1, 1, 15, 0),
      (2, 'I would recommend JavaScript since it is used everywhere - web, mobile, backend.', 1, 1, 8, 1),
      (3, 'Congratulations! Keep building and learning.', 1, 2, 24, 0),
      (4, 'Haha, this is gold!', 1, 3, 45, 2)`);
    
    console.log('Database seeded successfully!');
    console.log('');
    console.log('Test credentials:');
    console.log('Username: testuser');
    console.log('Password: password123');
    console.log('');
    console.log('Subreddits created: technology, programming, funny, askreddit');
    console.log('Posts created: 4');
    console.log('Comments created: 4');
  });

  db.close();
}

seed().catch(console.error);

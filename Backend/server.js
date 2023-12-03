// load package
const express = require('express');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const cors = require('cors');
const jwt  = require('jsonwebtoken');

const JWT_SECRET = 'wzt206';
const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();
app.use(cors());

app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const connection = mysql.createConnection({
    // host: '0.0.0.0'/localhost: Used to  locally run app
    host: "mysql1",
    user: "root",
    password: "admin"
  });

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
}); 

app.get('/init', (req, res) => {
  connection.query(`CREATE DATABASE IF NOT EXISTS postsdb`, function (error, result) {
    if (error) return console.log(error);

    connection.query(`USE postsdb`, function (error, results) {
      if (error) return console.log(error);

      const tables = ['post_likes', 'comment_likes', 'comments', 'posts', 'users'];
      tables.forEach(table => {
        connection.query(`DROP TABLE IF EXISTS ${table}`, function (error, result) {
          if (error) return console.log(error);
        });
      });

      connection.query(`CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (id))`, function (error, result) {
        if (error) return console.log(error);
      });

      connection.query(`CREATE TABLE IF NOT EXISTS posts (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
        user_id INT UNSIGNED NOT NULL,
        topic VARCHAR(255) NOT NULL, 
        data TEXT NOT NULL, 
        likes INT DEFAULT 0,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, function (error, result) {
        if (error) return console.log(error);
      });

      connection.query(`CREATE TABLE IF NOT EXISTS comments (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        comment TEXT NOT NULL, 
        likes INT DEFAULT 0,
        parent_id INT UNSIGNED, 
        PRIMARY KEY (id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
        )`, function (error, result) {
        if (error) return console.log(error);
      });

      connection.query(`CREATE TABLE IF NOT EXISTS comment_likes (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        comment_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        action TINYINT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, function (error, result) {
        if (error) return console.log(error);
      });

      connection.query(`CREATE TABLE IF NOT EXISTS post_likes (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        action TINYINT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, function (error, result) {
        if (error) return console.log(error);
      });

      connection.query(`INSERT INTO users (name, password, isAdmin) VALUES ('admin', '123', true)`, function (error, result) {
        if (error) return console.log(error);
        console.log('Database and tables initialized successfully.');
        res.send('Database and tables initialized successfully.');
      });
    });
  });
});



app.get('/data', (req, res) => {
  res.json(data);
  });

app.post('/addpost', (req, res) => {
    var topic = req.body.topic;
    var data = req.body.data;
    var user_id = req.body.user_id;
    var query = `INSERT INTO posts (topic, data, user_id) VALUES (?, ?, ?)`;
    connection.query(query, [topic, data, user_id], function (error, result) {
        if (error) console.log(error);
        res.json('New post added');
    });
});

app.get('/getposts', (req, res) => {
  const sql = 'SELECT posts.*, users.name AS username FROM posts JOIN users ON posts.user_id = users.id';
  connection.query(sql, function (error, result) {
      if (error) console.log(error);
      res.json({ 'posts': result });
  });
});

app.get('/getposts/:id', function (req, res) {
  const postId = parseInt(req.params.id, 10);
  
  // Ensure postId is a valid number
  if (isNaN(postId)) {
    return res.status(400).send('Invalid post ID');
  }

  const sql = 'SELECT posts.*, users.name AS username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?';

  connection.query(sql, [postId], function (error, result, fields) {
     if (error) {
         console.error(error);
         res.status(500).send('Server Error');
     } else {
         res.json({ 'posts': result });
     }
  });
});

app.post('/addcomment', (req, res) => {
  var { post_id, comment, user_id, parent_id } = req.body;
  var query = `INSERT INTO comments (post_id, comment, user_id, parent_id) VALUES (?, ?, ?, ?)`;
  connection.query(query, [post_id, comment, user_id, parent_id || null], function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send('Error adding comment');
    } else {
      res.json({ message: 'New comment added', id: result.insertId }); 
    }
  });
});

// Retrieve comments and structure them for nested display
// It takes all the users comments and their usernames of  who made them for a 
// specific post, and sort these comments by their ID in ascending order.
app.get('/getcomments/:post_id', (req, res) => {
  const post_id = req.params.post_id;
  const sql = `
    SELECT c.*, u.name AS username, 
           (SELECT IFNULL(SUM(action), 0) 
            FROM comment_likes 
            WHERE comment_id = c.id) AS likes
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.id`;

  connection.query(sql, [post_id], function (error, comments) {
    if (error) {
      console.error('Error retrieving comments:', error);
      res.status(500).send('Error retrieving comments');
    } else {
      res.json({ comments: comments });
    }
  });
});

// User Stuff Login and Registration Stuff
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Access denied. Only an admin can delete items.');
  }
};


app.post('/login', (req, res) => {
  const { name, password } = req.body;
  connection.query('SELECT * FROM users WHERE name = ?', [name], (error, results) => {
      if (error) {
          console.log(error);
          res.status(500).send('Server error');
      } else if (results.length > 0) {
          if (password === results[0].password) {
            const userRole = results[0].isAdmin ? 'admin' : 'user';
            // Generate a token
            const token = jwt.sign(
              { userId: results[0].id, role: userRole }, 
              JWT_SECRET, 
              { expiresIn: '1h' });
            res.status(200).json({ 
              message: 'Login successful', 
              token,
              name: results[0].name,
              id: results[0].id
             });
          } else {
              res.status(401).send('Incorrect password');
          }
      } else {
          res.status(404).send('User not found');
      }
  });
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users WHERE name = ?', [name], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      });
    });

    if (userExists) {
      return res.status(409).send('User already exists');
    }

    // Insert the new user into the database
    connection.query('INSERT INTO users (name, password) VALUES (?, ?)', [name, password], (error, result) => {
      if (error) {
        throw error; // This will be caught by the catch block
      } else {
        res.status(201).json({ message: 'Register successful', name: name });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getusers', (req, res) => {
  connection.query('SELECT * FROM users', function (error, result) {
      if (error) console.log(error);
      res.json({ 'users': result });
  });
});

// Create one special account for a system administrator 
// (can be hardcoded) that has the power to remove users, posts and replies.
app.delete('/delete/posts/:id', authenticateToken, isAdmin, (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM posts WHERE id=?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    } else {
      res.send('User deleted successfully');
    }
  });
});

app.delete('/delete/messages/:id', authenticateToken, isAdmin, (req, res) => {
  const id = req.params.id;

  // Check to see if the comment has replies
  connection.query('SELECT * FROM comments WHERE parent_id = ?', [id], (err, replies) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error checking for replies.');
    }

    if (replies.length > 0) {
      return res.status(400).send('Cannot delete a comment that has replies.');
    }

    connection.query('DELETE FROM comments WHERE id=?', [id], (deleteErr, result) => {
      if (deleteErr) {
        console.error(deleteErr);
        res.status(500).send('Error deleting comment.');
      } else {
        res.send('Comment deleted successfully');
      }
    });
  });
});

app.delete('/delete/users/:id', authenticateToken, isAdmin, (req, res) => {
  // Check if the user is admin
  const id = req.params.id;
  const sql = 'DELETE FROM users WHERE id=?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user.');
    } else {
      res.send('Users deleted successfully');
    }
  });
});

app.post('/updateLikes/comment/:commentId', (req, res) => {
  const { commentId } = req.params;
  const { delta, userId } = req.body;

  // Check the current action of the user on the comment
  connection.query('SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error checking user's like/dislike status");
    }

    if (results.length === 0) {
      // User hasn't liked/disliked this comment, so insert new action
      connection.query('INSERT INTO comment_likes (comment_id, user_id, action) VALUES (?, ?, ?)', [commentId, userId, delta], (insertError) => {
        if (insertError) {
          console.error(insertError);
          return res.status(500).send("Error recording like/dislike action");
        }
        // Update the likes count on the comment
        connection.query('UPDATE comments SET likes = likes + ? WHERE id = ?', [delta, commentId], (updateError) => {
          if (updateError) {
            console.error(updateError);
            return res.status(500).send("Error updating likes");
          }
          res.json({ message: 'Likes updated successfully!'});
        });
      });
    } else {
      // User is changing their action, update the record
      const newAction = delta > 0 ? 1 : -1;
      connection.query('UPDATE comment_likes SET action = ? WHERE comment_id = ? AND user_id = ?', [newAction, commentId, userId], (updateError) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).send("Error updating like/dislike action");
        }
        // Update the likes count on the comment
        connection.query('UPDATE comments SET likes = likes + ? WHERE id = ?', [delta, commentId], (updateLikesError) => {
          if (updateLikesError) {
            console.error(updateLikesError);
            return res.status(500).send("Error updating likes");
          }
          res.json({ message: 'Likes updated successfully!'});
        });
      });
    }
  });
});

app.post('/updateLikes/post/:postId', (req, res) => {
  const { postId } = req.params;
  const { delta, userId } = req.body;

  // Check the current action of the user on the comment
  connection.query('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error checking user's like/dislike status");
    }

    if (results.length === 0) {
      // User hasn't liked/disliked this post, so insert new action
      connection.query('INSERT INTO post_likes (post_id, user_id, action) VALUES (?, ?, ?)', [postId, userId, delta], (insertError) => {
        if (insertError) {
          console.error(insertError);
          return res.status(500).send("Error recording like/dislike action");
        }
        // Update the likes count on the post
        connection.query('UPDATE posts SET likes = likes + ? WHERE id = ?', [delta, postId], (updateError) => {
          if (updateError) {
            console.error(updateError);
            return res.status(500).send("Error updating likes");
          }
          res.json({ message: 'Likes updated successfully!'});
        });
      });
    } else {
      // User is changing their action, update the record
      const newAction = delta > 0 ? 1 : -1;
      connection.query('UPDATE post_likes SET action = ? WHERE post_id = ? AND user_id = ?', [newAction, postId, userId], (updateError) => {
        if (updateError) {
          console.error(updateError);
          return res.status(500).send("Error updating like/dislike action");
        }
        connection.query('UPDATE posts SET likes = likes + ? WHERE id = ?', [delta, postId], (updateLikesError) => {
          if (updateLikesError) {
            console.error(updateLikesError);
            return res.status(500).send("Error updating likes");
          }
          res.json({ message: 'Likes updated successfully!'});
        });
      });
    }
  });
});

// Search endpoints
// Searching user's name involvement in posts and comments
app.get('/searchbyuser/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const sql = `
  SELECT DISTINCT p.*
  FROM posts p
  LEFT JOIN comments c ON p.id = c.post_id
  JOIN users u ON u.id = p.user_id OR u.id = c.user_id
  WHERE LOWER(u.name) = ?
  `;

  connection.query(sql, [username], (error, results) => {
      if (error) {
          console.error(error);
          res.status(500).send('Server Error');
      } else {
          res.json({ 'posts': results });
      }
  });
});


// Search same string in posts and comments
app.get('/searchbystring/:searchString', (req, res) => {
  const searchString = `%${req.params.searchString.toLowerCase()}%`;
  const sql = `
  SELECT DISTINCT p.*
  FROM posts p
  LEFT JOIN comments c ON p.id = c.post_id
  WHERE LOWER(p.topic) LIKE ? OR LOWER(p.data) LIKE ? OR LOWER(c.comment) LIKE ?
  `;

  connection.query(sql, [searchString, searchString, searchString], (error, results) => {
      if (error) {
          console.error(error);
          res.status(500).send('Server Error');
      } else {
          res.json({ 'posts': results });
      }
  });
});

app.get('/usersbypostcount', (req, res) => {
  const sql = `
    SELECT u.name, COUNT(p.id) AS postCount
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY postCount DESC
  `;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
});

// Endpoint to get posts ordered by comment count
app.get('/postsbycommentcount', (req, res) => {
  const sql = `
    SELECT p.*, COUNT(c.id) AS commentCount
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
    ORDER BY commentCount DESC
  `;

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Server Error');
    } else {
      res.json(results);
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
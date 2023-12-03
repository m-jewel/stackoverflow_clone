// ShowPosts.js
import '../styles/ShowPost.css';
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faTrash } from '@fortawesome/free-solid-svg-icons';

const ShowPosts = () => {
  const [posts, setPosts] = useState([]);
  const [userAction, setUserAction] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:8080/getposts')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.posts)) {
          setPosts(data.posts.map(post => ({ ...post, userAction: null })));
        }
      })
      .catch(error => console.error(error));
  }, []);

  // Function to handle post deletion
  const deletePost = postId => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/delete/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    })
    .then(response => {
      if (response.ok) {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      } else {
        console.error('Failed to delete post.');
      }
    })
    .catch(error => console.error('Error:', error));
  };

  // Function to handle likes update
  const updateLikes = (postId, delta) => {
    const userId = user.id;
  
    fetch(`http://localhost:8080/updateLikes/post/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delta, userId }),
    })
    .then(response => {
      if (response.ok) {
        setPosts(currentPosts => currentPosts.map(post => {
          if (post.id === postId) {
            return { ...post, likes: post.likes + delta };
          }
          return post;
        }));
      }
    })
    .catch(error => console.error("Error updating likes:", error));
  };

  // Function to handle like button click
  const handleLike = (postId) => {
    if (!user) {
      alert("Please log in to like a post!");
      return;
    }
    updateLikes(postId, 1);
    setUserAction(userAction === 'like' ? null : 'like');
  };

  // Function to handle dislike button click
  const handleDislike = (postId) => {
    if (!user) {
      alert("Please log in to dislike a post!");
      return;
    }
    updateLikes(postId, -1);
    setUserAction(userAction === 'dislike' ? null : 'dislike');
  };

  return (
    <div className="posts-container">
      <div className="add-post-container">
        <Link to="/AddPost" className='add-post-btn'>Add New Post</Link>
      </div>
      <ul className="posts-list">
        {posts.map(post => (
          <li key={post.id} className="post-item">
            <Link to={`/getposts/${post.id}`}>{post.topic}</Link>
            <div className='footer'>
              <span className="like-counter">{post.likes}</span>
              <FontAwesomeIcon icon={faThumbsUp} className="icon" onClick={() => handleLike(post.id)} />
              <FontAwesomeIcon icon={faThumbsDown} className="icon" onClick={() => handleDislike(post.id)} />
              {user && user.name === 'admin' && (
                <FontAwesomeIcon icon={faTrash} className="icon delete-icon" onClick={() => deletePost(post.id)} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowPosts;

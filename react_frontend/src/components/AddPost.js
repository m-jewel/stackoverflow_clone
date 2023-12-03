import React, { useState, useContext } from 'react';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const AddPost = ({ onAddPost = () => {} }) => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState('');   
  const { user } = useContext(UserContext); 
  const navigate = useNavigate(); 
  
  // Function to handle the submission of a new post
  const handleAddPost = () => {
    // Check if the user is logged in
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    fetch('http://localhost:8080/addpost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, data, user_id: user.id }), // Sending the post data
    })
    .then(response => response.json())
    .then(() => {
      onAddPost(); 
      navigate('/ShowPosts'); 
    })
    .catch(error => console.error('Error adding post:', error));
  };

  return (
    <div>
      <h2>Add Post</h2>
      <label>
        Topic:
        <input 
          type="text" 
          value={topic} 
          onChange={e => setTopic(e.target.value)} 
        />
      </label>
      <br />
      <label>
        Data:
        <textarea 
          value={data} 
          onChange={e => setData(e.target.value)}
        />
      </label>
      <br />
      <button className='add-post-btn' onClick={handleAddPost}>Add Post</button>
    </div>
  );
};

export default AddPost;

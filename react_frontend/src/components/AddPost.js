import React, { useState, useContext } from 'react';
import UserContext from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const AddPost = ({ onAddPost = () => {} }) => {
  const [topic, setTopic] = useState(''); // State to hold the topic of the post
  const [data, setData] = useState('');   // State to hold the post body
  const { user } = useContext(UserContext); // Accessing the user context
  const navigate = useNavigate(); // Hook to navigate between routes

  // Function to handle the submission of a new post
  const handleAddPost = () => {
    // Check if the user is logged in
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    // API call to add a new post
    fetch('http://localhost:8080/addpost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, data, user_id: user.id }), // Sending the post data
    })
    .then(response => response.json())
    .then(() => {
      onAddPost(); // Callback function after adding the post
      navigate('/ShowPosts'); // Navigate to the ShowPosts page
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
          onChange={e => setTopic(e.target.value)} // Update topic state on change
        />
      </label>
      <br />
      <label>
        Data:
        <textarea 
          value={data} 
          onChange={e => setData(e.target.value)} // Update data state on change
        />
      </label>
      <br />
      <button onClick={handleAddPost}>Add Post</button>
    </div>
  );
};

export default AddPost;

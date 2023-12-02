// Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // State hooks for storing name and password
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Hook to navigate to different routes
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents default form submission behavior

    // Attempt to register the user
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }), // Convert data to JSON string
      });

      // Check the response status
      if (response.ok) {
        // Registration successful
        alert('Registration successful!');
        navigate('/login'); // Redirect to login page
      } else if (response.status === 409) {
        // User already exists
        alert('User already exists. Please log in.');
        navigate('/login'); // Redirect to login page
      } else {
        // Handle other errors
        const errorMsg = await response.text();
        alert(`Registration failed! ${errorMsg}`);
      }
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)} // Update name on change
          required
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password on change
          required
        />
      </label>
      <button type="submit">Register</button> {/* Submit button */}
    </form>
  );
};

export default Register;

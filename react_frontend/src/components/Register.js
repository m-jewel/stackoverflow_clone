import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); 

    // Check if password match
    if (password !== confirmPassword) {
      alert('Passwords do not match! Please try again!')
      return;
    }

    // Else, register the user 
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }), 
      });

      if (response.ok) {
        alert('Registration successful!');
        navigate('/login'); // Redirect to login page
      } else if (response.status === 409) {
        // User already exists
        alert('User already exists. Please log in.');
        navigate('/login'); // Redirect to login page
      } else {
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

      <label>
        Confim Password:
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required
        />
      </label>

      <button type="submit">Register</button> {/* Submit button */}
    </form>
  );
};

export default Register;

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';

const Login = ({ onLogin }) => {
  // States for user's name and password
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Navigation hook to redirect user after login
  const navigate = useNavigate();

  // Accessing the UserContext to set user details
  const { setUser } = useContext(UserContext);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Attempt to log in
    try {
      const response = await fetch('http://localhost:8080/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });
      
      // Check if login is successful
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token in localStorage
        setUser({ name: data.name, id: data.id }); // Set user details in context
        onLogin({ name: data.name, id: data.id }); // Callback after successful login
        navigate('/'); // Redirect to home page
      } else {
        alert('Login failed! Reason: Incorrect name or password!');
      }
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='Login'>
      <label className='login-label'>
        Name:
        <input
          className='login-input'
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className='login-label'>
        Password:
        <input
          className='login-input'
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Log In</button>
    </form>
  );
};

export default Login;

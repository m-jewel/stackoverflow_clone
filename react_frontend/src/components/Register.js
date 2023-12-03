import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [skillLevel, setSkillLevel] = useState({
    beginner: false,
    intermediate: false,
    expert: false,
  });
  const navigate = useNavigate(); 

  const handleSkillChange = (e) => {
    setSkillLevel({ ...skillLevel, [e.target.name]: e.target.checked });
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); 

    // Check if password match
    if (password !== confirmPassword) {
      alert('Passwords do not match! Please try again!')
      return;
    }
  
    let selectedSkills = [];
    for (const [key, value] of Object.entries(skillLevel)) {
      if (value) selectedSkills.push(key);
    }

    // Else, register the user 
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password, skillLevel: selectedSkills }), 
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

      <label>
          <input
            type="checkbox"
            name="beginner"
            checked={skillLevel.beginner}
            onChange={handleSkillChange}
          />
          Beginner
        </label>
        <label>
          <input
            type="checkbox"
            name="intermediate"
            checked={skillLevel.intermediate}
            onChange={handleSkillChange}
          />
          Intermediate
        </label>
        <label>
          <input
            type="checkbox"
            name="expert"
            checked={skillLevel.expert}
            onChange={handleSkillChange}
          />
          Expert
        </label>

      <button type="submit">Register</button> 
    </form>
  );
};

export default Register;

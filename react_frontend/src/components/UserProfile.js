import '../styles/UserProfile.css';
import React, { useState, useContext, useEffect } from 'react';
import UserContext from '../context/UserContext';

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [newPassword, setNewPassword] = useState('');
  const [skillLevel, setSkillLevel] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:8080/userDetails/${user.id}`)
        .then(response => response.json())
        .then(data => {
          setSkillLevel(data.skillLevel); // Set the skill level
        })
        .catch(error => console.error('Error:', error));
    }
  }, [user]);

  const handlePasswordChange = async () => {
    const response = await fetch(`http://localhost:8080/updatePassword/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });

    if (response.ok) {
      alert('Password updated successfully!');
    } else {
      alert('Failed to update password!');
    }
  };

  return (
    <div className='user-profile'>
      <h1>User Profile: {user?.name}</h1>
      <p>Skill Level: {skillLevel}</p>
      <div>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <button onClick={handlePasswordChange}>Update Password</button>
      </div>
    </div>
  );
};

export default UserProfile;

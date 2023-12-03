import React, { useState, useEffect } from 'react';

const ShowUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/getusers')
      .then(response => response.json())
      .then(data => setUsers(data.users || []))
      .catch(error => console.error(error));
  }, []);

  // Function to handle the deletion of a user
  const deleteUser = userId => {
    const token = localStorage.getItem('token'); // Get the stored token for authorization
    fetch(`http://localhost:8080/delete/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token, // Use the token for authorization
      },
    })
    .then(response => {
      if (response.ok) {
        // Filter out the deleted user from the users state
        setUsers(users.filter(user => user.id !== userId));
      } else {
        console.error('Failed to delete user.'); 
      }
    })
    .catch(error => console.error('Error:', error)); 
  };

  // Render the list of users
  return (
    <div className="users-container">
      <ul className="users-list">
        {users.map(user => (
          <li key={user.id} className="user-item">
            {user.name}
            {user && user.name !== 'admin' && (
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowUsers;

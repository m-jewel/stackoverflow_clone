import React, { useState, useEffect } from 'react';

// ShowUsers component displays a list of users and allows deleting them
const ShowUsers = () => {
  // State to hold the list of users
  const [users, setUsers] = useState([]);

  // Fetch users when the component mounts
  useEffect(() => {
    fetch('http://localhost:8080/getusers')
      .then(response => response.json())
      .then(data => setUsers(data.users || [])) // Set the users state with fetched data
      .catch(error => console.error(error)); // Log any errors that occur
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
        console.error('Failed to delete user.'); // Log error if deletion fails
      }
    })
    .catch(error => console.error('Error:', error)); // Log any network errors
  };

  // Render the list of users
  return (
    <div className="users-container">
      <ul className="users-list">
        {users.map(user => (
          <li key={user.id} className="user-item">
            {user.name}
            {/* Render delete button for all users except 'admin' */}
            {user.name !== 'admin' && (
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowUsers;

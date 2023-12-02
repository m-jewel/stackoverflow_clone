// Search.js
import '../styles/Search.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Search = () => {
  // State for storing all posts and filtered posts
  const [allPosts, setAllPosts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchMode, setSearchMode] = useState('default'); // 'default', 'user', 'comment'
  const [selectedUser, setSelectedUser] = useState(''); // state to keep track of selected user
  const [users, setUsers] = useState([]);

  // Fetch all posts when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8080/getposts')
      .then(response => {
        // Set the fetched posts to state
        setAllPosts(response.data.posts);
        setFilteredData(response.data.posts);
      })
      .catch(error => {
        console.log('Error getting posts: ' + error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/usersbypostcount')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.log('Error getting users: ' + error);
      });
  }, []);

  // Sort posts when the sort option changes
  useEffect(() => {
    let sortedData = [...allPosts];
    if (searchMode === 'mostLiked') {
      // Sort posts by number of likes
      sortedData.sort((a, b) => b.likes - a.likes);
    }
    setFilteredData(sortedData);
  }, [searchMode, allPosts]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();

    switch (searchMode) {
        case 'user':
            // Perform user-based search
            axios.get(`http://localhost:8080/searchbyuser/${searchValue}`)
                .then(response => {
                    setFilteredData(response.data.posts);
                })
                .catch(error => {
                    console.log('Error searching posts by user: ' + error);
                });
            break;
        default:
            // Perform default search (all posts)
            axios.get(`http://localhost:8080/searchbystring/${searchValue}`)
                .then(response => {
                    setFilteredData(response.data.posts);
                })
                .catch(error => {
                    console.log('Error searching posts: ' + error);
                });
    }
  };

  const fetchPostsByCommentCount = () => {
    axios.get('http://localhost:8080/postsbycommentcount')
      .then(response => {
        setFilteredData(response.data);
      })
      .catch(error => {
        console.log('Error getting posts by comment count: ' + error);
      });
  };

// Handler for the dropdown change
const handleSortChange = (event) => {
  const value = event.target.value;
  setSearchMode(value);
  if (value === 'commentCount') {
    fetchPostsByCommentCount();
  }
};

return (
  <div className="Search">
    <div className="search-container" style={{ margin: '0 auto', marginTop: '10%' }}>
      <label htmlFor="search-input" style={{ marginRight: '10px' }}>Search:</label>
      <input id="search-input" type="text" onChange={handleSearch} />

      {/* Dropdown for selecting search mode */}
      <select onChange={handleSortChange} value={searchMode}>
         <option value="default">Default</option>
         <option value="user">Search by User</option>
         <option value="commentCount">Most Commented</option>
      </select>

      {/* Separate dropdown for selecting a user */}
      {searchMode === 'user' && (
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Users Post Count</option>
          {users.map(user => (
            <option key={user.name} value={user.name}>
              {user.name} ({user.postCount})
            </option>
          ))}
        </select>
      )}

    </div>
    <div>
      {filteredData.map(post => (
        <div key={post.id}>
          <Link to={`/getposts/${post.id}`}>{post.topic}</Link>
        </div>
      ))}
    </div>
  </div>
);
}

export default Search;

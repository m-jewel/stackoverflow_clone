import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

import LandingPage from './views/LandingPage';
import ShowPosts from './components/ShowPosts';
import AddPost from './components/AddPost';

import Login  from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserContext from './context/UserContext';

import ShowUsers from './components/ShowUsers';
import AddComment from './components/AddComment';
import Search from './components/Search';
import UserProfile from './components/UserProfile';

function App() {   
  const [user, setUser] = useState(null);
  const [getList, setList] = useState([]);  

  if(getList.length <1) {
    fetch('http://localhost:8080/getposts')
    .then(response => response.json())
    .then(response => setList(response))
  };

  const handleLogout = () => {
    setUser(null); // Clear user data on logout
  };

  const handleLogin = (userData) => {
    const userRole = userData.isAdmin ? 'admin' : 'user'; 
    setUser({ name: userData.name, id: userData.id, role: userRole });
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="App">
        <Router>
          <header className="App-header">
            <nav className="top-bar">
              <div>
                {user ? (
                  <>
                    <Link to="/userProfile">{user.name} </Link>
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className='nav-items'>Log in</Link>
                    <Link to="/register" className='nav-items'>Sign up</Link>
                  </>
                )}
            </div>
          </nav>
        </header>

        <aside className="sidebar">
          <Link to="/" className='side-items'>Home</Link>
          <Link to="/showPosts" className='side-items'>Questions</Link>
          <Link to="/showUsers" className='side-items'>Users</Link>
          <Link to="/search" className='side-items'>Search</Link>
        </aside>

        <main className="main-content">
          <Routes>
            <Route exact path='/' element={<LandingPage/>} />
            <Route path="/showPosts" element={<ShowPosts get={getList}/>} />
            <Route path="/showUsers" element={<ShowUsers />} />
            <Route path="/addPost" element={
              <ProtectedRoute>
                <AddPost set={setList} />
              </ProtectedRoute>
              } />
            <Route path="/getposts/:id" element={<AddComment />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/userProfile" element={<UserProfile />} />
          </Routes>
        </main>

      </Router>
    </div>
    </UserContext.Provider>
  );
}

export default App;
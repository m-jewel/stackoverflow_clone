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
    const userRole = userData.isAdmin ? 'admin' : 'user'; // This assumes your login response contains the isAdmin flag
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
                    <span>{user.name}</span>
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/Login" className='nav-items'>Log in</Link>
                    <Link to="/Register" className='nav-items'>Sign up</Link>
                  </>
                )}
            </div>
          </nav>
        </header>

        <aside className="sidebar">
          <Link to="/" className='side-items'>Home</Link>
          <Link to="/ShowPosts" className='side-items'>Questions</Link>
          <Link to="/ShowUsers" className='side-items'>Users</Link>
          <Link to="/Search" className='side-items'>Search</Link>
        </aside>

        <main className="main-content">
          <Routes>
            <Route exact path='/' element={<LandingPage/>} />
            <Route path="/ShowPosts" element={<ShowPosts get={getList}/>} />
            <Route path="/ShowUsers" element={<ShowUsers />} />
            <Route path="/AddPost" element={
              <ProtectedRoute>
                <AddPost set={setList} />
              </ProtectedRoute>
              } />
            <Route path="/getposts/:id" element={<AddComment />} />
            <Route path="/Login" element={<Login onLogin={handleLogin} />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Search" element={<Search />} />
          </Routes>
        </main>

      </Router>
    </div>
    </UserContext.Provider>
  );
}

export default App;
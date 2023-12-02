import React from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div>
            <h1 className='welcome-msg'>Welcome to the Posting Management System</h1>
            <p className='desc-msg'>This system allows you to add view and create posts.</p>
            
            <div>
                <h2 className='feature-title'>Features:</h2>
                <ul>
                    <li className='feature-list'>- Create a user log in</li>
                    <li className='feature-list'>- Add new post topic and data</li>
                    <li className='feature-list'>- View list of all posts</li>
                    <li className='feature-list'>- Reply to a post and a reply</li>
                </ul>
            </div>
        </div>
    );
};

export default LandingPage;

import React from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div>
            <h1 className='welcome-msg'>Welcome to the Posting Management System</h1>
            
            <div>
                <h2 className='feature-title'>Features:</h2>
                <ul>
                    <li className='feature-list'>- see/create/select channel/questions</li>
                    <li className='feature-list'>- see/create new messages or replies</li>
                    <li className='feature-list'>- reply to replies and visualize the nested replies</li>
                    <li className='feature-list'>- search data based on specific strings</li>
                    <li className='feature-list'>- search data based on content created by a specific user</li>
                    <li className='feature-list'>- show user's number of posts</li>
                    <li className='feature-list'>- sort post with most comments and replies</li>

                </ul>
            </div>
        </div>
    );
};

export default LandingPage;

import '../styles/Comment.css';
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faReply, faTrash } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../context/UserContext';

const Comment = ({ comment, onReply, onDelete, isNested }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [likes, setLikes] = useState(comment.likes || 0);
  const [userAction, setUserAction] = useState(null);
  const { user } = useContext(UserContext);

  // Function to handle reply submission
  const handleReply = () => {
    onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReply(false);
  };

  // Function to handle like action
  const handleLike = commentId => {
    if (!user) {
      alert("Please log in to like a comment!");
      return;
    }
    updateLikes(commentId, 1);
    setUserAction(userAction === 'like' ? null : 'like');
  };

  // Function to handle dislike action
  const handleDislike = commentId => {
    if (!user) {
      alert("Please log in to dislike a comment!");
      return;
    }
    updateLikes(commentId, -1);
    setUserAction(userAction === 'dislike' ? null : 'dislike');
  };

  const updateLikes = (commentId, delta) => {
    fetch(`http://localhost:8080/updateLikes/comment/${commentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delta, userId: user.id }),
    })
    .then(response => {
      if (response.ok) {
        setLikes(likes + delta);
        console.log("Likes updated");
      } else {
        setLikes(likes - delta); 
        console.error("Error updating likes");
      }
    })
    .catch(error => console.error("Error updating likes:", error));
  };

  return (
    <div className={`comment-container ${isNested ? 'nested-comment' : ''}`}>
      <p className="comment-text">{comment.username}: {comment.comment}</p>
      <div className='footer'>
        <span className="like-counter">{likes}</span>
        <FontAwesomeIcon icon={faThumbsUp} className="icon" onClick={() => handleLike(comment.id)} />
        <FontAwesomeIcon icon={faThumbsDown} className="icon" onClick={() => handleDislike(comment.id)} />
        <FontAwesomeIcon icon={faReply} className="icon" onClick={() => setShowReply(!showReply)} />
        
        {user && user.name === 'admin' && onDelete && (
          <FontAwesomeIcon icon={faTrash} className="icon delete-icon" onClick={() => onDelete(comment.id)} />
        )}
      </div>

      {showReply && (
        <>
          <textarea 
            className="new-comment-textarea" 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
          />
          <button className="add-comment-btn" onClick={handleReply}>
            Submit Reply
          </button>
        </>
      )}

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;

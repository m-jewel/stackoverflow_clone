import '../styles/AddComment.css';

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import UserContext from '../context/UserContext';
import Comment from './Comment';

// Function to structure comments into a nested format
const nestComments = (commentsList) => {
    const commentMap = {};
  
    commentsList.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
  
    commentsList.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      }
    });
  
    return Object.values(commentMap).filter(comment => !comment.parent_id);
  };
  

const AddComment = () => {
    const [post, setPost] = useState(null);
    const [newComment, setNewComment] = useState('');
    const { user } = useContext(UserContext);
    const [nestedComments, setNestedComments] = useState({});
    const { id } = useParams();

    useEffect(() => {
        if (!user) {
          console.error("Please log in/register to leave a comment!");
          return;
        }
    
        // Fetch post data
        fetch(`http://localhost:8080/getposts/${id}`)
          .then(response => response.json())
          .then(data => {
            setPost(data.posts[0]);
            // Fetch comments for the post
            return fetch(`http://localhost:8080/getcomments/${id}`);
          })
          .then(response => response.json())
          .then(data => {
            if (Array.isArray(data.comments)) {
              setNestedComments(nestComments(data.comments));
            } else {
              console.error('Expected comments data to be an array, received:', data.comments);
            }
          })
          .catch(error => console.error(error));
      }, [id, user]);
    

    const addComment = async () => {
        try {
          const response = await fetch('http://localhost:8080/addcomment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: id, comment: newComment, user_id: user.id }),
          });
    
          if (response.ok) {
            const addCommentData = await response.json();
            const newCommentObj = {
              id: addCommentData.id,
              username: user.name,
              comment: newComment,
              replies: [],
            };
    
            setNestedComments([...nestedComments, newCommentObj]);
            setNewComment('');
          } else {
            const errorText = await response.text();
            console.error('Failed to add comment:', errorText);
          }
        } catch (error) {
          console.error('Network error when trying to add comment:', error);
        }
      };

    const addReply = async (parentId, content) => {
        try {
            const bodyData = {
                post_id: id,
                comment: content,
                user_id: user.id,
                parent_id: parentId,
            };
            const response = await fetch('http://localhost:8080/addcomment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
    
            if (response.ok) {
                const replyData = await response.json();
                const newReplyObj = {
                    id: replyData.id, // The ID returned from the server
                    username: user.name, // Assuming you have the username in the user context
                    comment: content,
                    replies: [], // Start with an empty replies array
                    parent_id: parentId, // Set the parent_id to link it to the parent comment
                };
    
                // Update the nestedComments state to include the new reply
                setNestedComments(currentComments => {
                    // Function to recursively find and update the parent comment with the new reply
                    const addReplyToComment = (comments, parentId, reply) => {
                        return comments.map(comment => {
                            if (comment.id === parentId) {
                                return { ...comment, replies: [...comment.replies, reply] };
                            } else if (comment.replies) {
                                return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
                            }
                            return comment;
                        });
                    };
    
                    return addReplyToComment(currentComments, parentId, newReplyObj);
                });
            } else {
                // Handle the error if the response is not ok
                const errorText = await response.text();
                console.error('Failed to add reply:', errorText);
            }
        } catch (error) {
            console.error('Network error when trying to add reply:', error);
        }
    };
       

    const removeNestComment = (nestedComments, commentId) => {
        return nestedComments.reduce((acc, comment) => {
          if (comment.id === commentId) {
            // If this is the comment to remove, skip it
            return acc;
          }
          if (comment.replies.length > 0) {
            // If this comment has replies, check them as well
            comment = { ...comment, replies: removeNestComment(comment.replies, commentId) };
          }
          return [...acc, comment];
        }, []);
      };

      const deleteComment = async (commentId) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/delete/messages/${commentId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer ' + token,
            },
          });
      
          if (response.ok) {
            // Update the state to reflect the deletion
            const updatedComments = removeNestComment(nestedComments, commentId);
            setNestedComments(updatedComments);
          } else {
            console.error('Failed to delete comment.');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

    if (!post) {
        return <div>Cannot access `Questions.` Please log in or register.</div>;
    };

    return (
        <div className="post-container">
            <h1 className="post-title">{post.topic} by {post.username}</h1> 
            <p className="post-content">{post.data}</p>

            <div className="comment-form">
                <textarea 
                    className="new-comment-textarea" 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                />
                <button className="add-comment-btn" onClick={addComment}>
                    Add Comment
                </button>
            </div>
    
            <div className="comments-section">
                <h3>Comments</h3>
                {Object.entries(nestedComments).map(([parentId, commentData]) => {
                    return (
                    <React.Fragment key={parentId}>
                        <Comment 
                        key={'comment-' + commentData.id}
                        comment={commentData} 
                        onReply={addReply} 
                        onDelete={deleteComment} 
                        />
                    </React.Fragment>
                    );
                })}
            </div>

        </div>
    );
}

export default AddComment;

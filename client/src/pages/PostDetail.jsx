import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postService, authService } from '../services/api';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const currentUser = authService.getCurrentUser();

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await postService.getPost(id);
      setPost(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment || !currentUser) return;

    const newComment = {
      _id: Date.now(), // Temporary ID for optimistic update
      user: { _id: currentUser.id, username: currentUser.username },
      content: comment,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setPost((prevPost) => ({
      ...prevPost,
      comments: [...(prevPost.comments || []), newComment],
    }));
    setComment('');

    try {
      await postService.addComment(id, { content: newComment.content });
      // No need to refetch, as the optimistic update already added it.
      // If server returns full comment object, we can update with that.
    } catch (err) {
      console.error(err);
      // Revert optimistic update if API call fails
      setPost((prevPost) => ({
        ...prevPost,
        comments: prevPost.comments.filter((c) => c._id !== newComment._id),
      }));
      setComment(newComment.content); // Restore comment in input
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading || !post) return <p className="text-center text-xl mt-8">Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {post.featuredImage && (
          <img
            src={`http://localhost:5000/uploads/${post.featuredImage}`}
            alt={post.title}
            className="w-full h-96 object-cover rounded-md mb-6"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        <div className="text-gray-600 text-sm mb-4">
          <p>Category: <span className="font-medium">{post.category?.name || 'No Category'}</span></p>
          <p>Author: <span className="font-medium">{post.author?.username || 'Unknown'}</span></p>
          <p>Published: <span className="font-medium">{new Date(post.createdAt).toLocaleDateString()}</span></p>
        </div>
        <p className="text-gray-700 leading-relaxed mb-8">{post.content}</p>

        {/* Comments Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>
        {post.comments && post.comments.length > 0 ? (
          <ul className="space-y-4 mb-8">
            {post.comments.map((c) => (
              <li key={c._id} className="bg-gray-50 p-4 rounded-md shadow-sm">
                <p className="text-gray-800">{c.content}</p>
                <p className="text-sm text-gray-500 mt-1">
                  — <span className="font-medium">{c.user?.username || 'Anonymous'}</span> on {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 mb-8">No comments yet. Be the first to comment!</p>
        )}

        {/* Add Comment Form */}
        {currentUser && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Add a Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Submit Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

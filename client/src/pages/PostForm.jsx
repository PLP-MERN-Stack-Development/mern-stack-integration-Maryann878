import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    featuredImage: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPost = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await postService.getPost(id);
      setFormData({
        title: data.title,
        content: data.content,
        category: data.category?._id || '',
        featuredImage: null, // Don't pre-fill file input for security reasons
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch post for editing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('content', formData.content);
      form.append('category', formData.category);
      if (formData.featuredImage) form.append('featuredImage', formData.featuredImage);

      if (id) {
        await postService.updatePost(id, form);
      } else {
        await postService.createPost(form);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while saving the post.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-xl mt-8">Loading form...</p>;

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{id ? 'Edit Post' : 'Create Post'}</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows="8"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <label htmlFor="featuredImage" className="block text-gray-700 text-sm font-bold mb-2">
            Featured Image (optional)
          </label>
          <input
            type="file"
            id="featuredImage"
            onChange={(e) => setFormData({ ...formData, featuredImage: e.target.files[0] })}
            className="w-full p-3 border border-gray-300 rounded-md bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (id ? 'Update Post' : 'Create Post')}
          </button>
        </form>
      </div>
    </div>
  );
}

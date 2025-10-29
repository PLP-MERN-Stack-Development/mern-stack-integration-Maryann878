import { useState, useEffect } from 'react';
import { postService, categoryService } from '../services/api';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories, loading: loadingCategories, error: categoriesError } = useApi(categoryService.getAllCategories);

  const { data: postData, loading: loadingPosts, error: postsError } = useApi(() =>
    postService.getAllPosts(page, 5, categoryFilter, search)
  );

  useEffect(() => {
    if (postData) {
      setPosts(postData.posts);
    }
  }, [postData]);

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  if (loadingCategories || loadingPosts) return <p className="text-center text-xl mt-8 text-gray-700">Loading posts...</p>;
  if (categoriesError || postsError) return <p className="text-center text-red-600 text-xl mt-8">Error loading posts or categories. Please try again later.</p>;

  return (
    <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-10 text-center">Our Blog</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center">
        {/* Search */}
        <div className="flex w-full max-w-md">
          <input
            type="text"
            placeholder="Search posts by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-r-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1); // Reset to first page on category change
          }}
          className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-gray-700 shadow-sm"
        >
          <option value="">All Categories</option>
          {categories && categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-12">No posts found. Why not create one?</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {posts.map((post) => (
            <li key={post._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out overflow-hidden border border-gray-200">
              <Link to={`/posts/${post._id}`} className="block">
                {post.featuredImage && (
                  <img
                    src={`http://localhost:5000/uploads/${post.featuredImage}`}
                    alt={post.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    By <span className="font-semibold text-gray-700">{post.author?.username || 'Unknown'}</span> on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-md text-gray-700 leading-relaxed line-clamp-3 mb-4">{post.content}</p>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                      {post.category?.name || 'Uncategorized'}
                    </span>
                    <span className="flex items-center space-x-1">
                      {/* You can add icons here, e.g., for comments or views */}
                      <span>{post.comments?.length || 0} Comments</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {postData && postData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-12">
          {Array.from({ length: postData.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              disabled={page === i + 1}
              className={`py-3 px-5 rounded-full text-base font-semibold transition-all duration-300 ease-in-out shadow-md
                ${page === i + 1
                  ? 'bg-indigo-600 text-white shadow-indigo-500/50'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

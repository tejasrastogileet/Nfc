'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    } else {
      fetchPosts();
    }
  }, [slug, page]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get('/content/blog', {
        params: { page, limit: 10 }
      });
      setPosts(res.data.data.posts || []);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await axiosInstance.get(`/content/blog/${slug}`);
      setSelectedPost(res.data.data);
    } catch (error) {
      toast.error('Blog post not found');
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (selectedPost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => router.push('/blog')}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          ← Back to Blog
        </button>

        {selectedPost.image && (
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={selectedPost.image}
              alt={selectedPost.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">{selectedPost.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>By {selectedPost.author}</span>
          <span>•</span>
          <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{selectedPost.views} views</span>
        </div>

        {selectedPost.excerpt && (
          <p className="text-lg text-gray-700 mb-6 italic">{selectedPost.excerpt}</p>
        )}

        <div className="prose prose-lg max-w-none mb-8 text-gray-700 whitespace-pre-wrap">
          {selectedPost.content}
        </div>

        {/* Related Posts */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">More Articles</h2>
          <button
            onClick={() => router.push('/blog')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Read all blog posts →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">NFC Store Blog</h1>
        <p className="text-gray-600 text-lg">Articles and guides about NFC technology</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold mb-2">No blog posts yet</h2>
          <p className="text-gray-600">Check back soon for updates!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => router.push(`/blog/${post.slug}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              >
                {post.image && (
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {post.excerpt || post.content?.substring(0, 100)}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.author}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg border ${
                    page === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

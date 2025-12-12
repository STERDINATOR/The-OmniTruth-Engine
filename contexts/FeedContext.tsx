
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Post } from '../types';
import { fetchTrendingPosts } from '../services/geminiService';

interface FeedContextType {
  posts: Post[];
  loading: boolean;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  refreshFeed: () => Promise<void>;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshFeed();
  }, []);

  const refreshFeed = async () => {
    setLoading(true);
    const trendingPosts = await fetchTrendingPosts();
    setPosts(trendingPosts);
    setLoading(false);
  };

  const addPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  return (
    <FeedContext.Provider value={{ posts, loading, addPost, updatePost, refreshFeed }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

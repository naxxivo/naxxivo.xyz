import React, { useState, useEffect, useCallback } from 'react';
import { pb } from '../services/pocketbase';
import type { User } from '../types';
import { UserCard } from '../components/UserCard';
import { Spinner } from '../components/Spinner';
import { useDebounce } from '../hooks/useDebounce';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-created');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const fetchUsers = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const perPage = 12;
      const filter = debouncedSearchTerm ? `name ~ "${debouncedSearchTerm}"` : '';
      const resultList = await pb.collection('users').getList<User>(currentPage, perPage, {
        sort: sortBy,
        filter,
        requestKey: null,
      });
      
      setUsers(prevUsers => currentPage === 1 ? resultList.items : [...prevUsers, ...resultList.items]);
      setTotalPages(resultList.totalPages);
    } catch (err: any) {
      setError('Failed to fetch users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy]);

  useEffect(() => {
    setPage(1);
    setUsers([]);
    fetchUsers(1);
  }, [debouncedSearchTerm, sortBy, fetchUsers]);

  useEffect(() => {
    if (page > 1) {
        fetchUsers(page);
    }
  }, [page, fetchUsers]);

  const loadMore = () => {
    if (page < totalPages) {
        setPage(p => p + 1);
    }
  }

  return (
      <main className="bg-surface p-6 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-text-primary">Discover Users</h1>
            <p className="text-text-secondary mt-2">Browse, search, and connect with other members.</p>
        </div>
        
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
            <input
                type="search"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="-created">Newest First</option>
                <option value="+created">Oldest First</option>
                <option value="name">Name (A-Z)</option>
            </select>
        </div>

        {loading && page === 1 ? (
          <div className="flex justify-center mt-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="text-center text-red-400 mt-16">{error}</div>
        ) : users.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
            {page < totalPages && (
                 <div className="flex justify-center mt-10">
                    <button onClick={loadMore} disabled={loading} className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-opacity-50">
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                 </div>
            )}
          </>
        ) : (
          <p className="text-center text-text-secondary mt-16">
            No users found for your search criteria.
          </p>
        )}
      </main>
  );
};
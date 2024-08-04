import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../../components/layout';
import { FiEdit2, FiTrash2, FiUsers, FiClock, FiBarChart2, FiStar, FiSettings, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { createQueueSubscription } from '../../lib/supabase';

export default function QueueOwnerDashboard() {
  const { data: session } = useSession();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [queueToDelete, setQueueToDelete] = useState(null);
  useEffect(() => {
    fetchQueues();
  
    const subscription = createQueueSubscription((payload) => {
      setQueues((prevQueues) => {
        return prevQueues.map((queue) => {
          if (queue.id === payload.new.id) {
            return {
              ...queue,
              ...payload.new,
              participantCount: payload.new.users_in_line ? payload.new.users_in_line.length : 0,
              averageRating: payload.new.average_rating,
              estimatedServiceTime: payload.new.estimated_service_time
            };
          }
          return queue;
        });
      });
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/queue-owner/queue-dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch queues');
      }
      const data = await response.json();
      setQueues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQueue = async () => {
    if (queueToDelete) {
      try {
        const response = await fetch(`/api/queue-owner/queue-dashboard?queueId=${queueToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete queue');
        }
        fetchQueues(); // Refresh the queue list
        setShowDeleteModal(false);
        setQueueToDelete(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openDeleteModal = (queueId) => {
    setQueueToDelete(queueId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setQueueToDelete(null);
  };

  return (
    <Layout>
      <Head>
        <title>Owner Dashboard | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Queue Owner Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : queues.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">No queues found. Create your first queue!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queues.map((queue) => (
              <div key={queue._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">{queue.name}</h2>
                    <div className="flex items-center text-gray-700">
                      <FiStar className="mr-1" />
                      <span>{queue.averageRating ? `${queue.averageRating.toFixed(1)}` : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-700">
                      <FiUsers className="mr-2" />
                      <span>{queue.participantCount} in line</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiClock className="mr-2" />
                      <span>{queue.estimatedServiceTime} min service time</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link href={`/queue-owner/manage-queue/${queue.id}`} className="text-blue-500 hover:text-blue-700">
                      <FiSettings className="inline mr-1" /> Manage
                    </Link>
                    <button onClick={() => openDeleteModal(queue.id)} className="text-red-5000 hover:text-red-700">
                      <FiTrash2 className="inline mr-1" /> Delete
                    </button>
                    <Link href={`/queue-owner/analytics/${queue.id}`} className="text-green-500 hover:text-green-700">
                      <FiBarChart2 className="inline mr-1" /> Analytics
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/queue-owner/create-queue" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Queue
          </Link>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Queue</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this queue? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteQueue}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

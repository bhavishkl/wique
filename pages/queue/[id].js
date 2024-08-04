import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../../components/layout';
import QueueReviews from '../../components/AddReview';
import { FiClock, FiMapPin, FiUsers, FiInfo, FiCalendar, FiUser, FiList } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import { createQueueSubscription } from '../../lib/supabase';
import QueueIdSkeleton from '../../components/skeletons/QueueId';

export default function QueueDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQueueDetails();

      const subscription = createQueueSubscription((payload) => {
        if (payload.new && payload.new.id === id) {
          setQueue((prevQueue) => {
            if (!prevQueue) return payload.new;
            return {
              ...prevQueue,
              ...payload.new,
              isUserInQueue: prevQueue.isUserInQueue,
              userPosition: prevQueue.userPosition,
              peopleInLine: payload.new.users_in_line ? payload.new.users_in_line.length : 0,
              userEstimatedWaitTime: calculateWaitTime(payload.new),
              estimatedRealTime: calculateEstimatedRealTime(payload.new),
            };
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const calculateWaitTime = (queueData) => {
    const userPosition = queueData.users_in_line.findIndex(entry => entry.user === session.user.id) + 1;
    return queueData.estimated_service_time * (userPosition ? userPosition - 1 : queueData.users_in_line.length);
  };

  const calculateEstimatedRealTime = (queueData) => {
    const waitTime = calculateWaitTime(queueData);
    return new Date(Date.now() + waitTime * 60000).toISOString();
  };

  const fetchQueueDetails = async () => {
    try {
      const response = await fetch(`/api/queue/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue details');
      }
      const data = await response.json();
      const updatedData = {
        ...data,
        peopleInLine: data.users_in_line.length,
        userEstimatedWaitTime: calculateWaitTime(data),
        estimatedRealTime: calculateEstimatedRealTime(data),
      };
      setQueue(updatedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleQueueAction = async () => {
    setButtonLoading(true);
    try {
      const action = queue.isUserInQueue ? 'leave' : 'join';
      const response = await fetch(`/api/queue/${action}?queueId=${id}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} queue`);
      }
      fetchQueueDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <QueueIdSkeleton />
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </Layout>
    );
  }
  
  if (!queue) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Queue Details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{queue.name} | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex justify-between items-center">
          <span>{queue.name}</span>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1 text-sm" />
            <span className="text-sm">{queue.average_rating.toFixed(1)}</span>
          </div>
        </h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Current Queue Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <FiUsers className="mr-2 text-purple-500 text-lg" />
                  <span className="text-base">{queue.peopleInLine} participants</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiClock className="mr-2 text-green-500 text-lg" />
                  <span className="text-base">
                    Est. wait: {queue.userEstimatedWaitTime} min
                    <br />
                    Est. time: {new Date(queue.estimatedRealTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {queue.isUserInQueue && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                  <p className="font-bold">Your position: {queue.userPosition}</p>
                </div>
              )}
              {queue.status === 'open' && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleQueueAction}
                    disabled={buttonLoading}
                    className={`flex-1 font-bold text-base py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                      queue.isUserInQueue
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    }`}
                  >
                    {buttonLoading ? (queue.isUserInQueue ? 'Leaving...' : 'Joining...') : (queue.isUserInQueue ? 'Leave Queue' : 'Join Queue')}
                  </button>
                  <Link href={`/queue/participants?id=${id}`} className="flex-1 font-bold text-base py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 flex items-center justify-center">
                    <FiList className="mr-2" />
                    View Participants
                  </Link>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiInfo className="mr-2 text-blue-500" />
                  Description
                </h3>
                <p className="mt-1 text-sm text-gray-500">{queue.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiMapPin className="mr-2 text-red-500" />
                  Location
                </h3>
                <p className="mt-1 text-sm text-gray-500">{queue.location}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiCalendar className="mr-2 text-green-500" />
                  Operating Hours
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {queue.operating_hours.start} - {queue.operating_hours.end}
                </p>
              </div>
            </div>
          </div>
        </div>
        <QueueReviews queueId={queue.id} />
      </div>
    </Layout>
  );
}
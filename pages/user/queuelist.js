import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../../components/layout';
import Link from 'next/link';
import { FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import { createQueueSubscription } from '../../lib/supabase';
import QListCompoSkeleton from '../../components/skeletons/QListCompo';

export default function QueueList() {
  const { data: session } = useSession();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueues();
  
    const subscription = createQueueSubscription((payload) => {
      setQueues((prevQueues) => {
        return prevQueues.map((queue) => {
          if (queue.id === payload.new.id) {
            return {
              ...queue,
              ...payload.new,
              peopleInLine: payload.new.users_in_line ? payload.new.users_in_line.length : 0,
              totalEstimatedWaitTime: payload.new.estimated_service_time * (payload.new.users_in_line ? payload.new.users_in_line.length : 0)
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
      const response = await fetch('/api/user/queuelist');
      if (!response.ok) {
        throw new Error('Failed to fetch queues');
      }
      const data = await response.json();
      setQueues(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <QListCompoSkeleton />
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
  
  return (
    <Layout>
      <Head>
        <title>Queue List | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Queues</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {queues.map((queue) => (
            <Link href={`/queue/${queue.id}`} key={queue.id}>
              <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{queue.name}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="mr-2" />
                  <span>{queue.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <FiUsers className="mr-2" />
                  <span>{queue.peopleInLine} in line</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiClock className="mr-2" />
                  <span>Est. wait: {queue.totalEstimatedWaitTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
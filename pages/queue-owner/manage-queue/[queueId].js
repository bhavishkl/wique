import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/layout';
import { FiCheck, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { createQueueSubscription } from '../../../lib/supabase';

export default function ManageQueue() {
  const router = useRouter();
  const { queueId } = router.query;
  const { data: session } = useSession();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueName, setQueueName] = useState('');

  useEffect(() => {
    if (queueId && queueId !== 'undefined') {
      fetchParticipants();
  
      const subscription = createQueueSubscription((payload) => {
        if (payload.new && payload.new.id === queueId) {
          setParticipants((prevParticipants) => {
            const updatedParticipants = payload.new.users_in_line.map((user, index) => {
              const existingParticipant = prevParticipants.find(p => p.user === user.user);
              return {
                ...existingParticipant,
                ...user,
                position: index + 1,
                name: existingParticipant?.name || user.name || user.email || 'Anonymous'
              };
            });
            return updatedParticipants;
          });
          setQueueName(payload.new.name);
        }
      });
  
      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(true);
    }
  }, [queueId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/queue-owner/manage-queue/${queueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue details');
      }
      const data = await response.json();
      setParticipants(data.users_in_line.map((user, index) => ({
        ...user,
        position: index + 1,
        name: user.name || user.email || 'Anonymous'
      })));
      setQueueName(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleParticipantAction = async (userId, action) => {
    try {
      const response = await fetch(`/api/queue-owner/manage-queue/${queueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      fetchParticipants();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!queueId || queueId === 'undefined') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading Queue Details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{queueName ? `Manage ${queueName}` : 'Manage Queue'} | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {queueName ? `Manage ${queueName}` : 'Manage Queue'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">No participants in the queue.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
            {participants.map((participant) => (
  <li key={participant.user}>
    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{participant.name === 'Anonymous' ? 'Anonymous' : participant.name.split('@')[0]}</div>          <div className="text-sm text-gray-500">Position: {participant.position}</div>
          <div className="text-sm text-gray-500">Joined: {new Date(participant.joined_at).toLocaleString()}</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleParticipantAction(participant.user, 'served')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiCheck className="mr-2" /> Served
        </button>
        <button
          onClick={() => handleParticipantAction(participant.user, 'noShow')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiX className="mr-2" /> No Show
        </button>
      </div>
    </div>
  </li>
))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
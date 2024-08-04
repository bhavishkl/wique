import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../../components/layout';
import { FiUser, FiClock } from 'react-icons/fi';
import { createQueueSubscription } from '../../lib/supabase';
import ParticipantsCompoSkeleton from '../../components/skeletons/ParticipantsCompo';

export default function QueueParticipants() {
  const router = useRouter();
  const { id } = router.query;
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchParticipants();
  
      const subscription = createQueueSubscription((payload) => {
        if (payload.new && payload.new.id === id) {
          const updatedParticipants = payload.new.users_in_line.map((user, index) => ({
            position: index + 1,
            name: user.name || user.email,
            joined_at: user.joined_at
          }));
          setParticipants(updatedParticipants);
        }
      });
  
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const fetchParticipants = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/queue/${id}/participants`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      const data = await response.json();
      setParticipants(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const maskName = (name) => {
    if (!name) return 'Unnamed';
    if (name.includes('@')) return name.split('@')[0];
    return name;
  };

  if (loading) {
    return (
      <Layout>
        <ParticipantsCompoSkeleton />
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
        <title>Queue Participants | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Queue Participants</h1>

        {/* Table view for larger screens */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => (
                <tr key={participant.position}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maskName(participant.name || participant.email)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(participant.joined_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responsive card view for small screens */}
        <div className="md:hidden">
          {participants.map((participant) => (
            <div key={participant.position} className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">Position: {participant.position}</span>
              </div>
              <div className="flex items-center mb-2">
                <FiUser className="mr-2 text-blue-500" />
                <span>{maskName(participant.name || participant.email)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiClock className="mr-2 text-green-500" />
                <span>{new Date(participant.joined_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
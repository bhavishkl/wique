import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "../components/layout";
import Link from "next/link";
import { FiSearch, FiMapPin, FiUsers } from "react-icons/fi";

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentQueues, setRecentQueues] = useState([]);

  useEffect(() => {
    if (session) {
      fetchQueueHistory();
    }
  }, [session]);

  const fetchQueueHistory = async () => {
    try {
      const response = await fetch('/api/user/queue-history');
      if (response.ok) {
        const data = await response.json();
        setRecentQueues(data);
      }
    } catch (error) {
      console.error('Error fetching queue history:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {session?.user?.name}</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for queues..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Recent Queues */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Queue History</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {recentQueues.map((queue) => (
            <div key={queue._id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md p-4 transition duration-300 ease-in-out transform hover:scale-105">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{queue.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <FiMapPin className="mr-2" />
                <span>{queue.location}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Button */}
        <div className="text-center">
          <Link href="/user/queuelist">
            <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out cursor-pointer">
              View All Queues
            </span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
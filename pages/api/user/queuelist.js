import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { data: queues, error } = await supabase
      .from('queues')
      .select(`
        id,
        name,
        location,
        users_in_line,
        estimated_service_time,
        max_capacity,
        queue_uid,
        average_rating
      `);

    if (error) throw error;

    const queuesWithWaitTime = queues.map(queue => ({
      ...queue,
      peopleInLine: queue.users_in_line ? queue.users_in_line.length : 0,
      totalEstimatedWaitTime: queue.estimated_service_time * (queue.users_in_line ? queue.users_in_line.length - 1 : 0)
    }));

    return res.status(200).json(queuesWithWaitTime);
  } catch (error) {
    console.error('Error fetching queues:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
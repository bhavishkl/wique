import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: queues, error } = await supabase
      .from('queues')
      .select(`
        id,
        name,
        description,
        location,
        max_capacity,
        estimated_service_time,
        operating_hours,
        status,
        users_in_line,
        average_rating
      `)
      .eq('owner', session.user.id);

    if (error) throw error;

    const formattedQueues = queues.map(queue => ({
      ...queue,
      participantCount: queue.users_in_line ? queue.users_in_line.length : 0,
      averageRating: queue.average_rating,
      estimatedServiceTime: queue.estimated_service_time
    }));

    res.status(200).json(formattedQueues);
  } catch (error) {
    console.error('Error fetching queues:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
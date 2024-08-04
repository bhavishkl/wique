import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const { data: queue, error } = await supabase
    .from('queues')
    .select('*')
    .eq('id', id)
    .single();

    if (error) throw error;

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) throw userError;

    const isUserInQueue = queue.users_in_line.some(entry => entry.user === user.id);
    const userPosition = isUserInQueue ? queue.users_in_line.findIndex(entry => entry.user === user.id) + 1 : null;
    const peopleInLine = queue.users_in_line.length;

    let estimatedWaitTime = 0;
    if (peopleInLine > 1 && userPosition) {
      estimatedWaitTime = queue.estimated_service_time * (userPosition - 1);
    }

    const queueDetails = {
      ...queue,
      isUserInQueue,
      userPosition,
      peopleInLine,
      userEstimatedWaitTime: estimatedWaitTime,
      estimatedRealTime: estimatedWaitTime > 0 ? new Date(Date.now() + estimatedWaitTime * 60000).toISOString() : null,
    };

    res.status(200).json(queueDetails);
  } catch (error) {
    console.error('Error fetching queue details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
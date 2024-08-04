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

  const { queueId } = req.query;

  try {
    const { data, error } = await supabase
      .from('queues')
      .select('usersInLine')
      .eq('id', queueId)
      .single();

    if (error) throw error;

    const isInQueue = data.usersInLine && data.usersInLine.some(entry => entry.user === session.user.id);

    return res.status(200).json({ isInQueue });
  } catch (error) {
    console.error('Error checking user in queue:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
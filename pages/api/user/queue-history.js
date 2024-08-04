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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('queueHistory')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: queueHistory, error: queueError } = await supabase
      .from('queues')
      .select('id, name, location')
      .in('id', user.queueHistory || []);

    if (queueError) throw queueError;

    return res.status(200).json(queueHistory);
  } catch (error) {
    console.error('Error fetching queue history:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
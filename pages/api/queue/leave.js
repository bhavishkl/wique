import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { queueId } = req.query;

  if (!queueId) {
    return res.status(400).json({ error: 'Queue ID is required' });
  }

  try {
    const { data: queue, error: queueError } = await supabase
      .from('queues')
      .select('users_in_line')
      .eq('id', queueId)
      .single();

    if (queueError) throw queueError;

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError) throw userError;

    const updatedUsersInLine = queue.users_in_line.filter(
      entry => entry.user !== user.id
    );

    const { error: updateError } = await supabase
      .from('queues')
      .update({ users_in_line: updatedUsersInLine })
      .eq('id', queueId);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Successfully left the queue' });
  } catch (error) {
    console.error('Error leaving queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
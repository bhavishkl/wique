import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { queueId } = req.query;

  if (!queueId || queueId === 'undefined') {
    return res.status(400).json({ error: 'Valid Queue ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const { data: queue, error } = await supabase
        .from('queues')
        .select('*')
        .eq('id', queueId)
        .single();

      if (error) throw error;

      if (!queue) {
        return res.status(404).json({ error: 'Queue not found' });
      }

      const userIds = queue.users_in_line.map(entry => entry.user);

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      const participants = queue.users_in_line.map((entry, index) => {
        const user = users.find(u => u.id === entry.user);
        return {
          position: index + 1,
          name: user ? user.name : null,
          email: user ? user.email : null,
          joined_at: entry.joined_at
        };
      });

      res.status(200).json({ ...queue, users_in_line: participants });
    } else if (req.method === 'POST') {
      const { userId, action } = req.body;

      if (!userId || !action) {
        return res.status(400).json({ error: 'User ID and action are required' });
      }

      const { data: queue, error: queueError } = await supabase
        .from('queues')
        .select('users_in_line')
        .eq('id', queueId)
        .single();

      if (queueError) throw queueError;

      let updatedUsersInLine = queue.users_in_line;

      if (action === 'served' || action === 'noShow') {
        updatedUsersInLine = updatedUsersInLine.filter(entry => entry.user !== userId);
      }

      const { data, error } = await supabase
        .from('queues')
        .update({ users_in_line: updatedUsersInLine })
        .eq('id', queueId)
        .select();

      if (error) throw error;

      res.status(200).json(data[0]);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in manage-queue API:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
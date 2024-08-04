import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  const { data: queue, error } = await supabase
    .from('queues')
    .select('users_in_line')
    .eq('id', id)
    .single();

  if (error) throw error;

  if (!queue) {
    return res.status(404).json({ message: 'Queue not found' });
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

  res.status(200).json(participants);
}
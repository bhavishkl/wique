import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';
import crypto from 'crypto';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, location, estimated_service_time, max_capacity, operating_hours, category } = req.body;
    
    console.log('Received data:', req.body);
  
    if (!name || !description || !location || !estimated_service_time || !max_capacity || !operating_hours || !category) {
      console.log('Missing fields:', { name, description, location, estimated_service_time, max_capacity, operating_hours, category });
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const queue_uid = crypto.randomBytes(4).toString('hex');
  
   // Fetch or create the user in the Supabase public.users table
let { data: userData, error: userError } = await supabase
.from('users')
.select('id')
.eq('email', session.user.email)
.single();

if (userError && userError.code !== 'PGRST116') {
console.error('Error fetching user:', userError);
return res.status(500).json({ error: 'Failed to fetch user data' });
}

if (!userData) {
console.log('User not found, creating new user');
const { data: newUser, error: createUserError } = await supabase
  .from('users')
  .insert({ 
    email: session.user.email, 
    name: session.user.name 
  })
  .select()
  .single();

if (createUserError) {
  console.error('Error creating user:', createUserError);
  return res.status(500).json({ error: 'Failed to create user' });
}

userData = newUser;
}

if (!userData.id) {
console.error('User ID is missing');
return res.status(500).json({ error: 'User ID is missing' });
}

console.log('User data:', userData);

    const { data, error } = await supabase
      .from('queues')
      .insert({
        name,
        description,
        location,
        estimated_service_time: parseInt(estimated_service_time, 10),
        max_capacity: parseInt(max_capacity, 10),
        queue_uid,
        owner: userData.id,
        users_in_line: [],
        status: 'open',
        created_at: new Date().toISOString(),
        operating_hours,
        category
      })
      .select()
      .single();
  
    if (error) {
      console.error('Error inserting queue:', error);
      throw error;
    }
  
    res.status(201).json({ 
      success: true, 
      queueId: data.id, 
      queueUid: data.queue_uid 
    });
  } catch (error) {
    console.error('Error creating queue:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
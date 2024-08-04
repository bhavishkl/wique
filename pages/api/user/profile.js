import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!user) {
      // If user doesn't exist, create a new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email: session.user.email, name: session.user.name })
        .select()
        .single();

      if (createError) throw createError;

      return res.status(200).json(newUser);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in user profile API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
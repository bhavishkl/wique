import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createQueueSubscription = (callback) => {
  return supabase
    .channel('public:queues')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, callback)
    .subscribe();
};
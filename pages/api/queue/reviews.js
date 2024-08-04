import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { queueId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    try {
      const { data: queue, error } = await supabase
        .from('queues')
        .select('reviews, average_rating')
        .eq('id', queueId)
        .single();

      if (error) throw error;

      if (!queue) {
        return res.status(404).json({ message: 'Queue not found' });
      }

      const currentReviews = queue.reviews || [];
      const newReview = {
        author: session.user.id,
        rating: parseInt(rating),
        comment,
        createdAt: new Date().toISOString()
      };

      const totalRating = currentReviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating;
      const newAverageRating = totalRating / (currentReviews.length + 1);

      const { error: updateError } = await supabase
        .from('queues')
        .update({ 
          reviews: [...currentReviews, newReview],
          average_rating: parseFloat(newAverageRating.toFixed(1))
        })
        .eq('id', queueId);

      if (updateError) throw updateError;

      return res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
      console.error('Error adding review:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else if (req.method === 'GET') {
    // ... (keep the GET method as is)
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
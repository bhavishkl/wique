import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/layout';
import QueueForm from '../../components/QueueForm';

export default function CreateQueue() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
    return null;
  }

  const handleSubmit = async (queueData) => {
    setIsSubmitting(true);
    try {
      const dataToSend = {
        name: queueData.name,
        description: queueData.description,
        location: queueData.location,
        max_capacity: parseInt(queueData.maxCapacity, 10),
        estimated_service_time: parseInt(queueData.estimatedServiceTime, 10),
        operating_hours: queueData.operatingHours,
        category: queueData.category
      };
      console.log('Data being sent:', dataToSend);
  
      const response = await fetch('/api/queue-owner/create-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create queue');
      }
  
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating queue:', error);
      alert(error.message || 'Failed to create queue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Create Queue | Wique</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Queue</h1>
        <QueueForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
}
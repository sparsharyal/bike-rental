'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/solid';
import { useForm } from 'react-hook-form';

export default function ReviewPage({ params }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [rental, setRental] = useState(null);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await fetch(`/api/rentals/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch rental');
        const data = await response.json();
        setRental(data);
      } catch (error) {
        console.error('Error fetching rental:', error);
        toast.error('Failed to load rental details');
        router.push('/customer/dashboard');
      }
    };

    if (session?.user) {
      fetchRental();
    }
  }, [session, params.id, router]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/rentals/${params.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: parseInt(data.rating),
          comment: data.comment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully');
      router.push('/customer/dashboard');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || !rental) {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'CUSTOMER') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Write a Review</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative h-24 w-24">
            <Image
              src={JSON.parse(rental.bike.images)[0]}
              alt={rental.bike.model}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div>
            <h2 className="font-medium text-lg">{rental.bike.model}</h2>
            <p className="text-gray-500">
              {new Date(rental.startDate).toLocaleDateString()} -{' '}
              {new Date(rental.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    {...register('rating', { required: 'Please select a rating' })}
                    className="sr-only"
                  />
                  <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400 peer-checked:text-yellow-400" />
                </label>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              {...register('comment', {
                required: 'Please write a comment',
                minLength: {
                  value: 10,
                  message: 'Comment must be at least 10 characters long'
                }
              })}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

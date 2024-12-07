import React, { useState, useEffect } from 'react';

const FeedbackForm = ({ sellerId, listingId, onSubmit, editingFeedback }) => {
  const [rating, setRating] = useState(editingFeedback?.rating || 1);
  const [comments, setComments] = useState(editingFeedback?.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingFeedback) {
      setRating(editingFeedback.rating);
      setComments(editingFeedback.comments);
    } else {
      setRating(5);
      setComments('');
    }
  }, [editingFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    if (!sellerId) {
      setError('Seller information is missing');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingFeedback
        ? `http://localhost:5000/api/feedback/${editingFeedback._id}`
        : 'http://localhost:5000/api/feedback';
      
      const method = editingFeedback ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receivedBy: sellerId,
          listingId: listingId || null,
          rating,
          comments
        })
      });

      if (response.ok) {
        setSuccess('Feedback submitted successfully!');
        onSubmit();
      
        // Clear fields instantly
        setComments('');
        setRating(5);
      
        // Remove success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error('Failed to submit feedback');
      }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="bg-white rounded-lg p-6 w-full">
      <h2 className="text-2xl font-bold text-[#3B4540] mb-4">
        {editingFeedback ? 'Edit Feedback' : 'Leave Feedback'}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        
          <label className="block text-gray-700">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`p-2 ${
                  rating >= value 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                style={{ fontSize: '50px' }}
              >
              ★
              </button>
            ))}
      
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-2 border rounded focus:border-[#438951] focus:outline-none"
            rows="4"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-4 py-2 bg-[#438951] text-white rounded hover:bg-[#357641] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;

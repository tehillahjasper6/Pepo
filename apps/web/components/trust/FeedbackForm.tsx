import React, { useState } from 'react';
import { feedbackAPI } from '@/lib/api/feedback';

interface FeedbackFormProps {
  giverId: string;
  receiverId: string;
  giveawayId: string;
  giveawayTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  receiverId,
  giveawayId,
  giveawayTitle,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    itemCondition: 'as-described',
    communicationQuality: 'good',
    wouldRecommend: true,
    rating: 5,
    comments: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await feedbackAPI.submitFeedback(receiverId, giveawayId, {
        itemCondition: formData.itemCondition,
        communicationQuality: formData.communicationQuality,
        wouldRecommend: formData.wouldRecommend,
        rating: formData.rating,
        comments: formData.comments,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-700 font-semibold">Thank you for your feedback! 🎉</p>
        <p className="text-sm text-green-600 mt-2">Your response helps improve our community</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-2">How was your experience?</h2>
      <p className="text-sm text-gray-600 mb-4">Feedback for: <span className="font-semibold">{giveawayTitle}</span></p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Condition */}
        <div>
          <label className="block text-sm font-semibold mb-2">Item Condition</label>
          <div className="space-y-2">
            {['as-described', 'better', 'worse'].map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="itemCondition"
                  value={option}
                  checked={formData.itemCondition === option}
                  onChange={(e) => setFormData({ ...formData, itemCondition: e.target.value })}
                  className="mr-2"
                />
                <span className="capitalize text-sm">{option.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Communication Quality */}
        <div>
          <label className="block text-sm font-semibold mb-2">Communication Quality</label>
          <div className="space-y-2">
            {['excellent', 'good', 'poor'].map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="communicationQuality"
                  value={option}
                  checked={formData.communicationQuality === option}
                  onChange={(e) => setFormData({ ...formData, communicationQuality: e.target.value })}
                  className="mr-2"
                />
                <span className="capitalize text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className={`text-2xl ${
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Recommend */}
        <div>
          <label className="block text-sm font-semibold mb-2">Would you recommend this giver?</label>
          <div className="space-y-2">
            {[true, false].map(value => (
              <label key={String(value)} className="flex items-center">
                <input
                  type="radio"
                  name="wouldRecommend"
                  value={value.toString()}
                  checked={formData.wouldRecommend === value}
                  onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.value === 'true' })}
                  className="mr-2"
                />
                <span className="text-sm">{value ? 'Yes' : 'No'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-semibold mb-2">Additional Comments (optional)</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            maxLength={500}
            placeholder="Share any additional feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.comments.length}/500</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;

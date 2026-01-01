'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PepoBee } from '@/components/PepoBee';
import { usePepo } from '@/hooks/usePepo';
import { useGiveaways } from '@/hooks/useGiveaways';
import { toast } from '@/components/Toast';

export default function CreateGiveawayPage() {
  const router = useRouter();
  const { showGiving, currentEmotion } = usePepo();
  const { createGiveaway } = useGiveaways();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    eligibilityGender: 'ALL',
    quantity: 1,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category || 'Other');
      formDataToSend.append('location', formData.location);
      formDataToSend.append('eligibilityGender', formData.eligibilityGender);
      formDataToSend.append('quantity', formData.quantity.toString());
      
      // Append images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Call API
      await createGiveaway(formDataToSend);
      
      // Show success animation
      setShowSuccess(true);
      showGiving();
      toast.success('🎁 Giveaway posted successfully!');
      
      // Redirect after animation
      setTimeout(() => {
        router.push('/browse');
      }, 2500);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create giveaway. Please try again.';
      toast.error(errorMsg);
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5);
      setImages(filesArray);
      
      // Create image previews
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="text-center">
          <PepoBee emotion="give" size={300} />
          <h2 className="text-3xl font-bold text-gray-900 mt-8">Giveaway Posted! 🎁</h2>
          <p className="text-gray-600 mt-4">Your item is now live and ready to share!</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to browse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <PepoBee emotion={currentEmotion} size={60} />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Post a Giveaway</h1>
              <p className="text-gray-600 mt-1">Share something wonderful with your community</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (up to 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="text-5xl mb-4">📷</div>
                <p className="text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG up to 5MB each
                </p>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vintage Bookshelf"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item in detail..."
              rows={4}
              className="input"
            />
          </div>

          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="">Select category</option>
                <option value="Furniture">Furniture</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Toys">Toys</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, NY"
                className="input"
              />
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eligibility (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Gender information is kept private and only used for eligibility
            </p>
            <div className="flex gap-3">
              {['ALL', 'MALE', 'FEMALE', 'OTHER'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, eligibilityGender: option })}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.eligibilityGender === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option === 'ALL' ? 'All' : option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="input w-32"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'Posting...' : 'Post Giveaway'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


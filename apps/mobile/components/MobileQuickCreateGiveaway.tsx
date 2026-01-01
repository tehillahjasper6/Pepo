'use client';

import { useState, useRef } from 'react';
import { Camera, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

/**
 * Mobile One-Tap Giveaway Creation Component
 * Simplified, quick giveaway creation for mobile users
 */
export function MobileQuickCreateGiveaway() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'category' | 'photos' | 'details'>('category');
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 1,
    condition: 'good',
    pickup: true,
    pickupDetails: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'clothing', label: '👕 Clothing', icon: '👕' },
    { id: 'furniture', label: '🪑 Furniture', icon: '🪑' },
    { id: 'electronics', label: '📱 Electronics', icon: '📱' },
    { id: 'books', label: '📚 Books', icon: '📚' },
    { id: 'toys', label: '🧸 Toys', icon: '🧸' },
    { id: 'sports', label: '⚽ Sports', icon: '⚽' },
    { id: 'home', label: '🏠 Home', icon: '🏠' },
    { id: 'other', label: '📦 Other', icon: '📦' },
  ];

  const conditions = ['like-new', 'good', 'fair', 'collectible'];

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId });
    setStep('photos');
  };

  const handleAddPhoto = async (source: 'camera' | 'gallery') => {
    if (source === 'camera' && cameraRef.current) {
      cameraRef.current.click();
    } else if (source === 'gallery' && fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    source: 'camera' | 'gallery'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In real app, upload to Cloudinary
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImages([...images, url]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Please enter a title');
      }
      if (!formData.category) {
        throw new Error('Please select a category');
      }
      if (images.length === 0) {
        throw new Error('Please add at least one photo');
      }

      // Submit giveaway
      const response = await fetch('/api/giveaways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create giveaway');
      }

      // Success
      setIsOpen(false);
      setStep('category');
      setImages([]);
      setFormData({
        title: '',
        description: '',
        category: '',
        quantity: 1,
        condition: 'good',
        pickup: true,
        pickupDetails: '',
      });

      // Show success toast (would integrate with toast service)
      alert('Giveaway created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-30 md:hidden"
          aria-label="Create giveaway"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden overflow-y-auto">
          <div className="min-h-screen flex items-end">
            <div className="w-full bg-white rounded-t-3xl shadow-2xl max-h-screen overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-lg font-bold text-gray-900">
                  Create Giveaway
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-4 pb-20">
                {/* Category Selection */}
                {step === 'category' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">
                      What are you giving away?
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`p-4 rounded-lg border-2 transition-all font-medium text-sm ${
                            formData.category === cat.id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{cat.icon}</div>
                          <div className="text-gray-900">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Upload */}
                {step === 'photos' && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">
                      Add photos ({images.length}/5 max)
                    </h3>

                    {/* Photo Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={img}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Photo Buttons */}
                      {images.length < 5 && (
                        <>
                          <button
                            onClick={() => handleAddPhoto('camera')}
                            className="border-2 border-dashed border-emerald-300 rounded-lg p-4 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-50"
                          >
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-xs">Camera</span>
                          </button>

                          <button
                            onClick={() => handleAddPhoto('gallery')}
                            className="border-2 border-dashed border-emerald-300 rounded-lg p-4 flex flex-col items-center justify-center text-emerald-600 hover:bg-emerald-50"
                          >
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-xs">Gallery</span>
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setStep('details')}
                      disabled={images.length === 0}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Details */}
                {step === 'details' && (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange('title', e.target.value)
                        }
                        placeholder="e.g., Blue Winter Jacket"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/100
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange('description', e.target.value)
                        }
                        placeholder="Size, color, condition details..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/500
                      </p>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleInputChange('quantity', parseInt(e.target.value))
                        }
                        min={1}
                        max={999}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {conditions.map((cond) => (
                          <button
                            key={cond}
                            onClick={() =>
                              handleInputChange('condition', cond)
                            }
                            className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                              formData.condition === cond
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {cond.charAt(0).toUpperCase() + cond.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pickup Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Available for Pickup
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.pickup}
                        onChange={(e) =>
                          handleInputChange('pickup', e.target.checked)
                        }
                        className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Pickup Details */}
                    {formData.pickup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Location/Details
                        </label>
                        <textarea
                          value={formData.pickupDetails}
                          onChange={(e) =>
                            handleInputChange('pickupDetails', e.target.value)
                          }
                          placeholder="Where and when can people pick up?"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                          rows={2}
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Create Giveaway
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e, 'camera')}
        className="hidden"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'gallery')}
        className="hidden"
      />
    </>
  );
}

export default MobileQuickCreateGiveaway;

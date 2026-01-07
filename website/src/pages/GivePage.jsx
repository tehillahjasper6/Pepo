import React, { useState } from 'react'
import { createItem } from '../utils/api'
import Navigation from '../components/layout/Navigation'
import Footer from '../components/layout/Footer'

const GivePage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [condition, setCondition] = useState('good')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await createItem({
        title,
        description,
        category,
        condition,
      })
      setSuccess(true)
      setTitle('')
      setDescription('')
      setCategory('other')
      setCondition('good')
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to create item. Make sure the backend is running at http://localhost:3000')
      console.error('Give error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-32 pb-16 container mx-auto px-4 max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Give an Item</h1>
        <p className="text-xl text-gray-600 mb-12">
          Share something you no longer need. Help someone else.
        </p>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-8">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg mb-8">
            ✓ Item created successfully! Your item has been added to the community.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Item Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Vintage Coffee Table"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the item, its condition, and any important details..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="furniture">Furniture</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="kitchenware">Kitchenware</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="toys">Toys & Games</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Item...' : 'Share This Item'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default GivePage

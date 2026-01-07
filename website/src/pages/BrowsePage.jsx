import React, { useState, useEffect } from 'react'
import { getItems } from '../utils/api'
import Navigation from '../components/layout/Navigation'
import Footer from '../components/layout/Footer'

const BrowsePage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const data = await getItems()
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Failed to load items. Make sure the backend is running at http://localhost:3000')
        console.error('Browse error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-32 pb-16 container mx-auto px-4 max-w-7xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Browse Items</h1>
        <p className="text-xl text-gray-600 mb-12">
          Find items available for you in your community.
        </p>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="mt-4 text-gray-600">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No items available yet.</p>
            <p className="text-gray-500 mt-2">Check back soon or start giving to help others!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <p className="text-sm text-gray-500 mb-4">Condition: {item.condition}</p>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all">
                  Request Item
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default BrowsePage

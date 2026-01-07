import React, { useEffect, useState } from 'react';

const NGOWishlist: React.FC<{ ngoId?: string; isPublic?: boolean }> = ({
  ngoId,
  isPublic = false,
}) => {
  const [wishlist, setWishlist] = useState<{ id: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all');
  const [newItem, setNewItem] = useState({
    itemName: '',
    description: '',
    category: 'other',
    quantity: 1,
    urgency: 'medium',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`/api/ngo/${ngoId}/wishlist`);
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const data = await res.json();
        setWishlist(data);
      } catch (error) {
        alert('Failed to fetch wishlist. Please try again later.');
        setWishlist(null);
      } finally {
        setLoading(false);
      }
    };
    if (ngoId) fetchWishlist();
  }, [ngoId]);

  const handleAddItem = async () => {
    try {
      const res = await fetch(`/api/ngo/${ngoId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error('Failed to add item');
      // Optionally, refetch wishlist
      const updated = await res.json();
      setWishlist(updated);
      setNewItem({
        itemName: '',
        description: '',
        category: 'other',
        quantity: 1,
        urgency: 'medium',
      });
      setShowForm(false);
    } catch (error) {
      alert('Failed to add item. Please try again.');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[urgency] || colors.medium;
  };

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-96" />;
  }

  const filteredItems = wishlist?.wishlistItems?.filter((item: any) => {
    if (filter === 'all') return true;
    if (filter === 'high') return ['high', 'critical'].includes(item.urgency);
    if (filter === 'critical') return item.urgency === 'critical';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Community Wishlist</h2>
          <p className="text-sm text-gray-600">
            Help us fulfill essential needs for our community
          </p>
        </div>
        {!isPublic && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Add Item Form */}
      {showForm && !isPublic && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.itemName}
            onChange={(e) =>
              setNewItem({ ...newItem, itemName: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Description"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="other">Category</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
            </select>

            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Quantity"
            />

            <select
              value={newItem.urgency}
              onChange={(e) =>
                setNewItem({ ...newItem, urgency: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'high'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Critical
        </button>
      </div>

      {/* Progress */}
      {isPublic && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Overall Fulfillment</p>
            <p className="text-lg font-bold">{wishlist?.stats?.percentageComplete}%</p>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${wishlist?.stats?.percentageComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems?.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{item.itemName}</h3>
                <span
                  className={`inline-block text-xs font-bold px-2 py-1 rounded-full mt-1 ${getUrgencyColor(
                    item.urgency
                  )}`}
                >
                  {item.urgency.toUpperCase()}
                </span>
              </div>
              {!isPublic && (
                <button className="text-gray-500 hover:text-red-600">✕</button>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3">{item.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Needed</span>
                <span className="font-semibold">{item.quantity} items</span>
              </div>

              {isPublic && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Received</span>
                    <span className="font-semibold">{item.fulfilled} items</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (item.fulfilled / item.quantity) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Help Fulfill This Item
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">Category: {item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NGOWishlist;

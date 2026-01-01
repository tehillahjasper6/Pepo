import React, { useEffect, useState } from 'react';
import { impactAPI } from '@/lib/api/impact';

interface EnvironmentalImpactCardProps {
  userId: string;
}

const EnvironmentalImpactCard: React.FC<EnvironmentalImpactCardProps> = ({ userId }) => {
  const [impact, setImpact] = useState<{ id: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const data = await impactAPI.getUserImpact(userId);
        setImpact(data);
      } catch (error) {
        // Failed to fetch environmental impact
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, [userId]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse h-48" />;
  }

  if (!impact) {
    return <div className="p-4 bg-red-50 rounded-lg text-red-600">Unable to load environmental impact</div>;
  }

  const equivalents = impact.equivalents || {};

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Environmental Impact</h3>
          <p className="text-sm text-gray-600">Your contribution to sustainability</p>
        </div>
        <div className="text-4xl">🌍</div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded p-4 text-center">
          <p className="text-sm text-gray-600 font-semibold">CO₂ Saved</p>
          <p className="text-2xl font-bold text-green-600">{impact.co2SavedKg.toFixed(1)}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
        <div className="bg-blue-50 rounded p-4 text-center">
          <p className="text-sm text-gray-600 font-semibold">Waste Diverted</p>
          <p className="text-2xl font-bold text-blue-600">{impact.wasteDivertedKg.toFixed(1)}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
      </div>

      {/* Equivalents */}
      <div className="bg-gray-50 rounded p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">That&#39;s like:</p>
        <div className="space-y-2 text-sm">
          {equivalents.carMilesDriven > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">🚗 Car miles not driven</span>
              <span className="font-semibold">{equivalents.carMilesDriven}</span>
            </div>
          )}
          {equivalents.treesPlanted > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">🌱 Trees planted</span>
              <span className="font-semibold">{equivalents.treesPlanted}</span>
            </div>
          )}
          {equivalents.plasticBottles > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">🔋 Plastic bottles</span>
              <span className="font-semibold">{equivalents.plasticBottles}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {impact.categoryBreakdown && Object.keys(impact.categoryBreakdown).length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold text-gray-700 mb-2">Top Categories</p>
          <div className="space-y-1 text-xs">
            {Object.entries(impact.categoryBreakdown)
              .sort((a: [string, { co2?: number }], b: [string, { co2?: number }]) => (b[1]?.co2 || 0) - (a[1]?.co2 || 0))
              .slice(0, 3)
              .map(([category, data]: [string, { count?: number }]) => (
                <div key={category} className="flex justify-between text-gray-600">
                  <span className="capitalize">{category}</span>
                  <span className="font-semibold">{data?.count || 0} items</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalImpactCard;

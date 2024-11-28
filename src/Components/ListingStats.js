import React from 'react';

const ListingStats = ({ listings }) => {
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'Active').length,
    sold: listings.filter(l => l.status === 'Sold').length,
    pending: listings.filter(l => l.status === 'Pending').length,
    totalViews: listings.reduce((sum, listing) => sum + (listing.views || 0), 0)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[
        { label: 'Total Listings', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Sold', value: stats.sold },
        { label: 'Pending', value: stats.pending },
        { label: 'Total Views', value: stats.totalViews }
      ].map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ListingStats; 
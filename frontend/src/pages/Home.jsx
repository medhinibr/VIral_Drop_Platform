import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import CampaignCard from '../components/CampaignCard';
import { useAppContext } from '../context/AppContext';
import { Loader2, AlertCircle } from 'lucide-react';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const { userId, userName, isAuthenticated } = useAppContext();
  const [notification, setNotification] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await apiService.getActiveCampaign();
      const campaignsArray = Array.isArray(data) ? data : (data ? [data] : []);
      setCampaigns(campaignsArray);
    } catch (err) {
      setError('Unable to retrieve current exhibitions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Poll for new events every 10 seconds to reflect newly created ones
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleClaim = async (campaignId) => {
    if (!isAuthenticated) {
      showNotification('Please acquire a membership to reserve entry.', 'error');
      return;
    }

    try {
      setClaiming(campaignId);
      await apiService.claimSlot({ campaignId, userName });
            
      showNotification('Reservation successful. Check your profile for details.');
      fetchCampaigns(); // Refresh count
    } catch (err) {
      showNotification(err?.error || 'Failed to claim reservation. It might be sold out.', 'error');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 shadow-2xl flex items-center space-x-3 border ${
              notification.type === 'error' 
                ? 'bg-red-50 text-red-800 border-red-200' 
                : 'bg-museum-dark text-museum-paper border-museum-dark'
            }`}
          >
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm font-medium tracking-wide">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-16">
        <h1 className="text-6xl md:text-7xl mb-4">Featured <br/><span className="text-museum-accent italic font-light">Collections</span></h1>
        <p className="text-museum-text/70 max-w-lg font-light text-lg">
          Discover exclusive, limited-entry exhibitions. Reserve your access before the gallery reaches full capacity.
        </p>
      </div>

      {loading && campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-museum-dark/40">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="tracking-widest uppercase text-sm font-medium">Curating gallery...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/50 border border-red-100 p-8 flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-serif text-xl mb-2">Gallery Unavailable</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-32 border border-museum-dark/10 bg-museum-light/50">
          <h2 className="text-3xl text-museum-dark mb-4">The Gallery is Empty</h2>
          <p className="text-museum-text/60">No exhibitions are currently active. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign, index) => (
            <CampaignCard 
              key={campaign._id}
              campaign={campaign}
              onClaim={handleClaim}
              claiming={claiming}
              claimedCampaigns={campaign.claimedUsers || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

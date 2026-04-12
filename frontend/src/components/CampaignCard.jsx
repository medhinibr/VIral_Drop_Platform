import React from 'react';
import { motion } from 'framer-motion';
import ClaimButton from './ClaimButton';

const CampaignCard = ({ campaign, onClaim, claiming, claimedCampaigns }) => {
  const currentClaimed = campaign.claimed || 0;
  const isSoldOut = currentClaimed >= campaign.limit;
  const isClaimedByUser = claimedCampaigns?.includes(campaign._id);
  const isNotStarted = new Date() < new Date(campaign.startTime);
  const remaining = campaign.limit - currentClaimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="card-museum relative overflow-hidden group flex flex-col justify-between h-full"
    >
      {/* Decorative frame line */}
      <div className="absolute inset-0 border border-museum-dark/5 m-3 pointer-events-none group-hover:border-museum-accent/30 transition-colors duration-500"></div>

      {/* Background abstract shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-museum-accent/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

      <div className="relative z-10 p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <span className="text-xs tracking-widest uppercase font-medium text-museum-accent bg-museum-dark/5 px-3 py-1 rounded-sm">
            Exhibition
          </span>
          {isSoldOut && (
            <span className="text-xs tracking-widest uppercase font-semibold text-red-700 border border-red-700/20 px-3 py-1 rounded-sm rotate-3 transform">
              Sold Out
            </span>
          )}
        </div>

        <h3 className="text-2xl mb-4 leading-snug group-hover:text-museum-accent transition-colors duration-300">
          {campaign.title}
        </h3>

        <div className="mt-auto space-y-4">
          <div className="border-b border-museum-dark/10 pb-4 mb-4">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-museum-text/50 mb-1">
              <span>Booking Opens</span>
              <span>Event Date</span>
            </div>
            <div className="flex justify-between font-serif text-sm text-museum-dark">
              <span>{new Date(campaign.startTime).toLocaleDateString()}</span>
              <span>{campaign.eventDate ? new Date(campaign.eventDate).toLocaleDateString() : 'TBA'}</span>
            </div>
          </div>
          <div className="flex justify-between items-end border-b border-museum-dark/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-museum-text/50 mb-1">Edition Size</p>
              <p className="font-serif text-lg text-museum-dark">{campaign.limit}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-museum-text/50 mb-1">Available</p>
              <p className={`font-serif text-lg ${remaining < (campaign.limit * 0.2) ? 'text-museum-accent font-bold' : 'text-museum-dark'}`}>
                {Math.max(0, remaining)}
              </p>
            </div>
          </div>

          <ClaimButton
            onClick={() => onClaim(campaign._id)}
            disabled={isSoldOut || isClaimedByUser || claiming === campaign._id || isNotStarted}
            loading={claiming === campaign._id}
            isClaimed={isClaimedByUser}
            isSoldOut={isSoldOut}
            isNotStarted={isNotStarted}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
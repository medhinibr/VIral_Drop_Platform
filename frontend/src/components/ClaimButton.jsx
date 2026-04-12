import React from 'react';
import { Loader2 } from 'lucide-react';

const ClaimButton = ({ onClick, disabled, loading, isClaimed, isSoldOut }) => {
  let buttonText = "Reserve Entry";
  if (loading) buttonText = "Reserving...";
  else if (isClaimed) buttonText = "Reservation Confirmed";
  else if (isSoldOut) buttonText = "Capacity Reached";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full group relative overflow-hidden px-6 py-3 border transition-all duration-300 ease-out font-medium text-sm tracking-wide uppercase ${
        isClaimed || isSoldOut || disabled && !loading
          ? 'bg-transparent text-museum-text/50 border-museum-dark/20 cursor-not-allowed'
          : 'bg-museum-dark text-museum-paper border-transparent hover:bg-museum-paper hover:text-museum-dark hover:border-museum-dark hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-center space-x-2 relative z-10 w-full h-full">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{buttonText}</span>
      </div>
      
      {/* Hover effect background fill block */}
      {!disabled && !loading && (
        <div className="absolute inset-x-0 bottom-0 h-0 bg-museum-paper transition-all duration-300 ease-out group-hover:h-full z-0 pointer-events-none"></div>
      )}
    </button>
  );
};

export default ClaimButton;

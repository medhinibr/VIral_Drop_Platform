import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import UploadImage from '../components/UploadImage';
import { User, Image as ImageIcon, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { userId, userName, isAuthenticated } = useAppContext();
  const [profileImage, setProfileImage] = useState(null);
  const [claimedEvents, setClaimedEvents] = useState([]);
  const [authoredEvents, setAuthoredEvents] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiService.getActiveCampaign();
        const campaignsArray = Array.isArray(data) ? data : (data ? [data] : []);
        const claimed = campaignsArray.filter(c => c.claimedUsers?.includes(userId)).map(c => c._id);
        const authored = campaignsArray.filter(c => c.createdBy === userId).map(c => c.title);
        setClaimedEvents(claimed);
        setAuthoredEvents(authored);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };
    
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const handleUploadSuccess = (imageUrl) => {
    setProfileImage(imageUrl);
    // Profile images are now strictly session-based until a backend schema supports it
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 w-full flex flex-col items-center justify-center text-center animate-fade-in">
        <h2 className="text-4xl mb-4 font-serif text-museum-dark">Membership Required</h2>
        <p className="text-museum-text/60 max-w-md mx-auto mb-8">
          Please verify your identity to access your personal collection dossier and records.
        </p>
        <Link to="/auth" className="btn-museum">Authenticate Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full">
      <div className="mb-12">
        <h1 className="text-5xl mb-4">Member <span className="font-light italic text-museum-text/50">Dossier</span></h1>
        <p className="text-museum-text/60 font-light text-lg">
          Your personal archive and exhibition records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-museum p-0 overflow-hidden"
          >
            <div className="p-6 border-b border-museum-dark/5 bg-white flex justify-center items-center overflow-hidden aspect-square">
              {profileImage ? (
                <div className="relative w-full h-full p-2 bg-museum-paper shadow-sm border border-black/5 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover filter contrast-125 saturate-50 hover:saturate-100 transition-all duration-700" 
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-museum-dark/5 border border-museum-dark/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-museum-dark/30" />
                </div>
              )}
            </div>
            
            <div className="p-6 bg-museum-light">
              <h3 className="font-serif text-xl mb-1 truncate text-museum-dark" title={userName}>
                {userName}
              </h3>
              <p className="text-xs uppercase tracking-widest text-museum-accent font-medium mb-6">
                Premium Member
              </p>
              
              <div className="space-y-3 text-sm text-museum-text/70">
                <div className="flex items-center space-x-3 pb-2 border-b border-museum-dark/5">
                  <MapPin className="w-4 h-4 text-museum-dark/40" />
                  <span>Global Exhibit Access</span>
                </div>
                <div className="flex items-center space-x-3 pb-2 border-b border-museum-dark/5">
                  <Calendar className="w-4 h-4 text-museum-dark/40" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-widest text-museum-dark mb-4 border-b border-museum-dark/10 pb-2">
              Update Portrait
            </h4>
            <UploadImage onUploadSuccess={handleUploadSuccess} />
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            <h4 className="text-sm font-semibold uppercase tracking-widest text-museum-dark mb-6 border-b border-museum-dark/10 pb-2 flex justify-between items-end">
              <span>Reservation Ledger</span>
              <span className="text-xs font-normal text-museum-text/50">{claimedEvents.length} Records found</span>
            </h4>
            
            {claimedEvents.length > 0 ? (
              <div className="space-y-4">
                {claimedEvents.map((id, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={index} 
                    className="group bg-white border border-museum-dark/10 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md hover:border-museum-dark/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-museum-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                    
                    <div className="mb-4 sm:mb-0 pl-3">
                      <p className="text-xs text-museum-text/50 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Exhibition ID</span>
                      </p>
                      <p className="font-mono text-sm text-museum-dark">{id}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100">
                      <Clock className="w-3 h-3" />
                      <span>Confirmed</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-museum-dark/20 bg-museum-light text-center p-12 text-museum-text/50">
                <ImageIcon className="w-12 h-12 mb-4 text-museum-dark/20" />
                <p className="text-lg mb-2">No reservations yet.</p>
                <p className="font-light max-w-sm">
                  Visit the gallery to secure your access to upcoming limited exhibitions.
                </p>
              </div>
            )}
            
            <h4 className="text-sm font-semibold uppercase tracking-widest text-museum-dark mt-10 mb-6 border-b border-museum-dark/10 pb-2 flex justify-between items-end">
              <span>Curated Exhibitions</span>
              <span className="text-xs font-normal text-museum-text/50">{authoredEvents.length} Published</span>
            </h4>
            
            {authoredEvents.length > 0 ? (
              <div className="space-y-4">
                {authoredEvents.map((title, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={`auth-${index}`} 
                    className="group bg-museum-dark text-museum-paper border border-museum-dark/10 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-museum-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                    
                    <div className="mb-4 sm:mb-0 pl-3">
                      <p className="text-xs text-museum-paper/50 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Created Campaign</span>
                      </p>
                      <p className="font-serif text-lg">{title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-museum-text/50 italic">No original curation records found for this identity.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

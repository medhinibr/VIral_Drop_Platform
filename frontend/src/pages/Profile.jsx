import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import UploadImage from '../components/UploadImage';
import { User, Image as ImageIcon, MapPin, Calendar, Clock, Edit2, Check, X, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { userId, userName, isAuthenticated, userPhoto, updateUserProfile } = useAppContext();
  const [profileImage, setProfileImage] = useState(userPhoto || null);

  useEffect(() => {
    if (userPhoto) {
      setProfileImage(userPhoto);
    }
  }, [userPhoto]);
  const [claimedEvents, setClaimedEvents] = useState([]);
  const [authoredEvents, setAuthoredEvents] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(userName);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCurated, setSelectedCurated] = useState(null);

  const handleEditName = async () => {
    if (isEditingName) {
      if (editNameValue.trim() !== '' && editNameValue !== userName) {
        if (updateUserProfile) {
          await updateUserProfile({ displayName: editNameValue });
        }
      }
    } else {
      setEditNameValue(userName);
    }
    setIsEditingName(!isEditingName);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiService.getActiveCampaign();
        const campaignsArray = Array.isArray(data) ? data : (data ? [data] : []);
        const claimedArray = campaignsArray
          .filter(c => c.claimedUsers?.some(u => u === userId || String(u).startsWith(`${userId}|`)))
          .map(c => ({
            id: c._id,
            title: c.title,
            count: c.claimedUsers.filter(u => u === userId || String(u).startsWith(`${userId}|`)).length
          }));
        const authored = campaignsArray.filter(c => c.createdBy === userId).map(c => ({
          id: c._id,
          title: c.title,
          claimed: c.claimed || 0,
          limit: c.limit
        }));
        setClaimedEvents(claimedArray);
        setAuthoredEvents(authored);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };
    
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const handleUploadSuccess = async (imageUrl) => {
    setProfileImage(imageUrl);
    if (updateUserProfile) {
      await updateUserProfile({ photoURL: imageUrl });
    }
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
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-museum-dark/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-museum-light w-full max-w-sm relative overflow-hidden shadow-2xl border border-museum-dark/20"
            >
              <button 
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-museum-dark/40 hover:text-museum-dark transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 text-center border-b border-museum-dark/10 bg-white">
                <QrCode className="w-8 h-8 mx-auto mb-4 text-museum-dark" />
                <h3 className="font-serif text-2xl text-museum-dark leading-tight mb-2">{selectedTicket.title}</h3>
                <p className="text-xs uppercase tracking-widest text-museum-accent font-medium">Valid Entry Pass</p>
              </div>
              
              <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-4 border border-museum-dark/10 shadow-sm mb-6 inline-block shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/profile')}`} 
                    alt="Admission QR Code" 
                    className="w-40 h-40 object-cover"
                  />
                </div>
                
                <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-museum-dark/10 pt-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-museum-text/50 mb-1">Quantity</span>
                    <span className="font-serif text-lg text-museum-dark">{selectedTicket.count} {selectedTicket.count > 1 ? 'Admissions' : 'Admission'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-museum-text/50 mb-1">Holder Name</span>
                    <span className="font-serif text-sm text-museum-dark truncate w-full inline-block" title={userName}>{userName}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-museum-dark text-museum-paper py-4 text-center text-xs tracking-widest uppercase shadow-inner">
                Present at Gallery Entrance
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedCurated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCurated(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-museum-dark/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-museum-dark text-museum-paper w-full max-w-sm relative shadow-2xl p-8 border border-museum-paper/10"
            >
              <button 
                onClick={() => setSelectedCurated(null)}
                className="absolute top-4 right-4 text-museum-paper/40 hover:text-museum-paper transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8">
                <User className="w-8 h-8 mx-auto mb-4 text-museum-paper/50" />
                <h3 className="font-serif text-2xl leading-tight mb-2">{selectedCurated.title}</h3>
                <p className="text-xs uppercase tracking-widest text-museum-accent font-medium">Curator Statistics</p>
              </div>
              
              <div className="grid grid-cols-2 gap-px bg-museum-paper/10">
                <div className="bg-museum-dark p-6 text-center">
                  <span className="block text-[10px] uppercase tracking-widest text-museum-paper/50 mb-2">Claimed</span>
                  <span className="font-serif text-3xl text-museum-paper">{selectedCurated.claimed}</span>
                </div>
                <div className="bg-museum-dark p-6 text-center">
                  <span className="block text-[10px] uppercase tracking-widest text-museum-paper/50 mb-2">Capacity</span>
                  <span className="font-serif text-3xl text-museum-paper">{selectedCurated.limit}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="flex items-center justify-between mb-1">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="font-serif text-xl bg-transparent border-b border-museum-dark/30 text-museum-dark focus:outline-none focus:border-museum-dark w-full mr-3"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleEditName()}
                  />
                ) : (
                  <h3 className="font-serif text-xl truncate text-museum-dark" title={userName}>
                    {userName}
                  </h3>
                )}
                <button onClick={handleEditName} className="text-museum-dark/40 hover:text-museum-dark transition-colors shrink-0">
                  {isEditingName ? <Check className="w-5 h-5 text-museum-accent" /> : <Edit2 className="w-4 h-4" />}
                </button>
              </div>
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
                {claimedEvents.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={index}
                    onClick={() => setSelectedTicket(item)}
                    className="group bg-white border border-museum-dark/10 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md hover:border-museum-dark/30 transition-all duration-300 relative overflow-hidden cursor-pointer w-full"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-museum-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                    
                    <div className="mb-4 sm:mb-0 pl-3">
                      <p className="text-xs text-museum-text/50 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Reserved {item.count} {item.count > 1 ? 'Entries' : 'Entry'}</span>
                      </p>
                      <p className="font-serif text-lg text-museum-dark">{item.title}</p>
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
                {authoredEvents.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={`auth-${index}`}
                    onClick={() => setSelectedCurated(item)}
                    className="group bg-museum-dark text-museum-paper border border-museum-dark/10 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md hover:bg-museum-dark/90 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-museum-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                    
                    <div className="mb-4 sm:mb-0 pl-3">
                      <p className="text-xs text-museum-paper/50 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Created Campaign</span>
                      </p>
                      <p className="font-serif text-lg">{item.title}</p>
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

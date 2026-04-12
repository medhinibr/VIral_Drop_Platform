import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';
import { Loader2, Plus, Calendar, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: '',
    limit: '',
    startTime: '',
    eventDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 w-full flex flex-col items-center justify-center text-center animate-fade-in">
        <h2 className="text-4xl mb-4 font-serif text-museum-dark">Identity Verification Required</h2>
        <p className="text-museum-text/60 max-w-md mx-auto mb-8">
          Only registered platform curators can draft new exhibition events into the gallery.
        </p>
        <Link to="/auth" className="btn-museum">Authenticate Now</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createCampaign({
        ...formData,
        limit: parseInt(formData.limit, 10)
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err?.error || 'Failed to curate exhibition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 w-full flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-24 h-24 mb-8 text-museum-accent bg-museum-accent/10 rounded-full flex items-center justify-center border border-museum-accent/20 shadow-[0_0_40px_-10px_rgba(192,160,98,0.5)]">
          <Plus className="w-10 h-10" />
        </div>
        <h2 className="text-4xl mb-4">Exhibition Curated</h2>
        <p className="text-museum-text/60 max-w-md mx-auto">
          Your new collection has been added to the gallery. Preparing digital archive space...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 w-full">
      <div className="mb-12 border-b border-museum-dark/10 pb-8">
        <h1 className="text-5xl mb-4">Curate <span className="font-light italic text-museum-text/50">Collection</span></h1>
        <p className="text-museum-text/60 font-light text-lg">
          Add a new exhibition to the digital archive. Define capacity and timing.
        </p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit} 
        className="card-museum space-y-8"
      >
        <div className="space-y-2">
          <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
            Exhibition Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-museum text-2xl font-serif py-3"
            placeholder="e.g., The Modernist Canvas"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 relative">
            <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
              Edition Limit
            </label>
            <div className="relative">
              <Hash className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-museum-dark/30" />
              <input
                type="number"
                name="limit"
                value={formData.limit}
                onChange={handleChange}
                required
                min="1"
                className="input-museum pl-8 text-xl"
                placeholder="e.g., 500"
              />
            </div>
            <p className="text-xs text-museum-text/40 pt-1">Maximum number of entries allowed.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
              Booking Opens On
            </label>
            <div className="relative">
              <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-museum-dark/30" />
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="input-museum pl-8 text-lg font-mono text-museum-dark/80"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-museum-dark/10 pt-6">
          <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
            Actual Event Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-museum-dark/30" />
            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
              className="input-museum pl-8 text-lg font-mono text-museum-dark/80"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="pt-8 mt-8 border-t border-museum-dark/10">
          <button
            type="submit"
            disabled={loading}
            className="btn-museum w-full md:w-auto md:min-w-[200px]"
          >
            <div className="flex items-center justify-center space-x-2 relative z-10 w-full h-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Collection</span>
              )}
            </div>
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateCampaign;

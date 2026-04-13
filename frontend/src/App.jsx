import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { useAppContext } from './context/AppContext';
import { LogOut, User, PlusCircle, Landmark, Menu, X as CloseIcon } from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated, logout } = useAppContext();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-museum-accent/30">
      <nav className="sticky top-0 z-50 bg-museum-paper/80 backdrop-blur-md border-b border-museum-dark/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group z-50">
            <Landmark className="w-6 h-6 sm:w-8 sm:h-8 text-museum-dark group-hover:text-museum-accent transition-colors duration-300" />
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-museum-dark">Exhibits</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${location.pathname === '/' ? 'text-museum-accent' : 'text-museum-text hover:text-museum-dark'}`}
            >
              Gallery
            </Link>
            <Link 
              to="/create" 
              className={`flex items-center space-x-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 border-b border-transparent hover:border-museum-dark pb-1 ${location.pathname === '/create' ? 'text-museum-accent border-museum-accent hover:border-museum-accent' : 'text-museum-text'}`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Curate</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-6 pl-6 border-l border-museum-dark/20">
                <Link to="/profile" className="flex items-center space-x-2 text-museum-text hover:text-museum-dark transition-colors duration-300">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={handleLogout} className="text-museum-text hover:text-red-700 transition-colors duration-300">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="pl-6 border-l border-museum-dark/20 text-sm font-medium tracking-wide uppercase">
                <Link to="/auth" className="btn-museum-secondary px-5 py-2">
                  Membership
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-museum-dark z-50 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-0 left-0 w-full h-screen bg-museum-paper flex flex-col items-center justify-center space-y-8 z-40 md:hidden animate-fade-in px-6">
            <Link 
              to="/" 
              className={`text-2xl font-serif tracking-wide uppercase ${location.pathname === '/' ? 'text-museum-accent' : 'text-museum-dark'}`}
            >
              Gallery
            </Link>
            <Link 
              to="/create" 
              className={`flex items-center space-x-3 text-2xl font-serif tracking-wide uppercase ${location.pathname === '/create' ? 'text-museum-accent' : 'text-museum-dark'}`}
            >
              <PlusCircle className="w-6 h-6" />
              <span>Curate</span>
            </Link>
            
            <div className="w-16 h-px bg-museum-dark/20 my-4"></div>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-3 text-2xl font-serif tracking-wide uppercase text-museum-dark">
                  <User className="w-6 h-6" />
                  <span>Dossier</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-3 text-2xl font-serif tracking-wide uppercase text-red-700 mt-4">
                  <LogOut className="w-6 h-6" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-museum text-lg px-8 py-3">
                Membership
              </Link>
            )}
          </div>
        )}
      </nav>

      <main className="flex-grow flex flex-col">
        {children}
      </main>
      
      <footer className="bg-museum-dark text-museum-paper py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Landmark className="w-6 h-6" />
              <span className="font-serif text-xl tracking-wide">Exhibits</span>
            </div>
            <p className="text-museum-paper/60 text-sm max-w-sm font-light mt-4 leading-relaxed">
              Reserving exclusive access to timeless artifacts and private events. A minimalistic approach to digital curation.
            </p>
          </div>
          <div className="flex justify-start md:justify-end items-end mt-8 md:mt-0">
            <p className="text-museum-paper/40 text-xs tracking-wider uppercase font-light">
              &copy; 2026 Exhibits Digital Archive.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create" element={<CreateCampaign />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

export default App;

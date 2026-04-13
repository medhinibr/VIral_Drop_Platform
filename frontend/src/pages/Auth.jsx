import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, UserPlus, LogIn } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase-config';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      setErrorMsg("Google Sign-in failed.");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMsg("Password reset link sent to your email.");
    } catch (error) {
      setErrorMsg("Failed to send reset email.");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      navigate('/');
    } catch (error) {
      console.error("Auth failed:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Email is already registered.');
      } else {
        setErrorMsg('Authentication failed. Please try again.');
      }
    }
  };

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        rotateY: direction > 0 ? 45 : -45,
        scale: 0.8
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        rotateY: direction < 0 ? 45 : -45,
        scale: 0.8
      };
    }
  };

  const direction = isLogin ? -1 : 1;

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 md:px-0 relative overflow-hidden bg-museum-light min-h-[80vh]">
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none opacity-5 select-none overflow-hidden">
        <h1 className="text-[20vw] font-serif leading-none whitespace-nowrap text-museum-dark">EXHIBITS</h1>
      </div>

      <div className="relative w-full max-w-md h-[680px] perspective-[1000px]">
        <AnimatePresence initial={false} custom={direction}>
          {isLogin ? (
            <motion.div
              key="login"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="absolute inset-0 card-museum bg-white shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-center mb-8">
                  <Landmark className="w-12 h-12 text-museum-dark" />
                </div>
                <h2 className="text-3xl text-center mb-2">Member <span className="font-light italic text-museum-text/50">Access</span></h2>
                <p className="text-center text-sm tracking-wider text-museum-text/50 uppercase mb-8">
                  Present your credentials
                </p>

                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
                      Access Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-museum"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-museum-dark/70 mb-2">
                      Passcode
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-museum"
                      placeholder="••••••••"
                    />
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={handleResetPassword} className="text-xs text-museum-text/60 hover:text-museum-dark underline underline-offset-2">
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-museum w-full mt-8 group flex justify-center items-center">
                    <span>Enter Gallery</span>
                    <LogIn className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-2" />
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px bg-museum-dark/10 flex-1"></div>
                  <span className="px-4 text-xs tracking-widest text-museum-dark/40 uppercase">Or</span>
                  <div className="h-px bg-museum-dark/10 flex-1"></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  className="w-full mt-6 py-3 border border-museum-dark/20 text-museum-dark font-medium text-sm tracking-wide uppercase hover:bg-museum-dark/5 transition-colors flex items-center justify-center"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                  Sign In with Google
                </button>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-museum-dark/10">
                <p className="text-sm text-museum-text/60">
                  Not a member?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-museum-accent hover:text-museum-dark transition-colors font-medium underline underline-offset-4"
                  >
                    Request Access
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                rotateY: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              className="absolute inset-0 card-museum bg-museum-dark text-museum-paper shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-center mb-8">
                  <Landmark className="w-12 h-12 text-museum-paper" />
                </div>
                <h2 className="text-3xl text-center mb-2">Become a <span className="font-light italic text-museum-paper/50">Member</span></h2>
                <p className="text-center text-sm tracking-wider text-museum-paper/50 uppercase mb-8">
                  Join the exclusive archive
                </p>

                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-900/50 border border-red-500/30 text-red-100 text-sm text-center">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-museum-paper/70 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent border-b border-museum-paper/20 text-museum-paper px-1 py-2 focus:outline-none focus:border-museum-paper transition-colors duration-300 placeholder:text-museum-paper/30"
                      placeholder="e.g., Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-museum-paper/70 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-museum-paper/20 text-museum-paper px-1 py-2 focus:outline-none focus:border-museum-paper transition-colors duration-300 placeholder:text-museum-paper/30"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-museum-paper/70 mb-2">
                      Passcode
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-museum-paper/20 text-museum-paper px-1 py-2 focus:outline-none focus:border-museum-paper transition-colors duration-300 placeholder:text-museum-paper/30"
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" className="w-full bg-museum-paper text-museum-dark px-6 py-3 font-medium text-sm tracking-wide uppercase hover:bg-museum-accent hover:text-museum-dark transition-colors duration-300 group flex justify-center items-center">
                    <span>Submit Application</span>
                    <UserPlus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-2" />
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                  <div className="h-px bg-museum-paper/10 flex-1"></div>
                  <span className="px-4 text-xs tracking-widest text-museum-paper/40 uppercase">Or</span>
                  <div className="h-px bg-museum-paper/10 flex-1"></div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  className="w-full mt-6 py-3 border border-museum-paper/20 text-museum-paper font-medium text-sm tracking-wide uppercase hover:bg-museum-paper/10 transition-colors flex items-center justify-center"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                  Sign Up with Google
                </button>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-museum-paper/10">
                <p className="text-sm text-museum-paper/60">
                  Already hold a membership?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-museum-accent hover:text-museum-paper transition-colors font-medium underline underline-offset-4"
                  >
                    Authenticate
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;

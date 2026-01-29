import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig'; // Ensure 'auth' is exported from config
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, UserPlus } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', or 'password'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const resetAll = () => {
    setEmail(''); setOtp(''); setPassword(''); setConfirmPassword('');
    setStep('email');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if user already exists in Firestore (optional but recommended)
      const userRef = doc(db, "users", email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        alert("Account already exists. Please login.");
        return navigate('/login');
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await setDoc(doc(db, "otp_codes", email.toLowerCase()), {
        code: generatedOtp,
        expires: Date.now() + 300000,
      });

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_email: email, otp_code: generatedOtp }, PUBLIC_KEY);
      setStep('otp');
    } catch (err) { alert("Error sending OTP"); } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "otp_codes", email.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().code === otp && Date.now() < docSnap.data().expires) {
        await deleteDoc(docRef);
        setStep('password');
      } else {
        alert("Invalid or Expired OTP. Try again.");
        resetAll();
      }
    } catch (err) { alert("Verification failed"); } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");
    setLoading(true);
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // 2. Save Profile in Firestore
      await setDoc(doc(db, "users", email.toLowerCase()), {
        uid: userCredential.user.uid,
        email: email,
        createdAt: new Date()
      });
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } catch (err) { 
      alert(err.message); 
      resetAll(); 
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl">
        <h1 className="text-3xl font-black text-center mb-6">Create Account</h1>
        
        <form onSubmit={step === 'email' ? handleSendOTP : step === 'otp' ? handleVerifyOTP : handleSignup} className="space-y-4">
          {step === 'email' && (
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border rounded-2xl" required />
          )}
          {step === 'otp' && (
            <input type="text" placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-4 border rounded-2xl text-center text-2xl tracking-widest" required />
          )}
          {step === 'password' && (
            <>
              <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-2xl" required />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 border rounded-2xl" required />
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : step === 'password' ? 'Complete Signup' : 'Next'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 font-medium">
          Already have an account? <Link to="/" className="text-blue-600 font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/home'); // Successful login navigation
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      alert("Account not found! Please create an account first.");
      navigate('/signup');
    } else {
      alert("Invalid credentials.");
    }
  } finally { setLoading(false); }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl">
        <h1 className="text-3xl font-black text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 border rounded-2xl" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-2xl" required />
          <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 font-medium">
          New here? <Link to="/signup" className="text-blue-600 font-bold underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
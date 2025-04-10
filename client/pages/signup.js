// client/pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Input sanitization
  const validateInputs = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All fields are required.');
      return false;
    }
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Invalid email address.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      // Save token in localStorage 
      localStorage.setItem('token', res.data.token);
      router.push('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Sign Up</h1>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input 
            type="text" 
            id="name" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            className="form-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password" 
            id="password" 
            className="form-control" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button className="btn btn-primary" type="submit">Sign Up</button>
      </form>
      <p className="mt-3">
        Already have an account? <Link href="/login" legacyBehavior><a>Login</a></Link>
      </p>
    </div>
  );
}

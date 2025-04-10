// client/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });
      localStorage.setItem('token', res.data.token);
      router.push('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      <form onSubmit={handleLogin}>
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
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
      <p className="mt-3">
        Don&apos;t have an account? <Link href="/signup" legacyBehavior><a>Sign Up</a></Link>
      </p>
    </div>
  );
}

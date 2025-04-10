import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import SeatGrid from '../components/SeatGrid.tsx';
import Link from 'next/link';

export default function Home() {
  const [seats, setSeats] = useState([]);
  const [numToBook, setNumToBook] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Move localStorage access to useEffect to avoid hydration mismatch
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (storedToken) {
      setCurrentUser(jwtDecode(storedToken));
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSeats();
    }
  }, [token]);

  // Loading current status of seats
  const fetchSeats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/seats');
      setSeats(res.data.seats);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load seats.');
    }
  };

  // Booking seats
  const bookSeats = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/book',
        { seats: parseInt(numToBook, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Booked seats: ${res.data.bookedSeats.join(', ')}`);
      // Reloading the current status of seats
      fetchSeats();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  // Cancelling the bookings
  const cancelBookings = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/cancel',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Cancelled seats: ${res.data.cancelledSeats.join(', ')}`);
      // Reloading the status of seats
      fetchSeats();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    router.push('/login');
  };

  return (
    <div className="container mt-5">
      <h1>Train Seating Dashboard</h1>
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      <p>
        Welcome, <strong>{currentUser?.email}</strong>!{' '}
        <Link href="/login" legacyBehavior>
          <a onClick={() => localStorage.removeItem('token')}>Logout</a>
        </Link>
      </p>
      
      <div className="row">
        {/* Seat Grid Column */}
        <div className="col-md-8 col-lg-9">
          {seats.length > 0 && (
            <SeatGrid seats={seats} currentUserId={currentUser?.id || null} />
          )}
        </div>
  
        {/* Booking Controls Column */}
        <div className="col-md-4 col-lg-3 mt-4 mt-md-0">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="7"
                    value={numToBook}
                    onChange={(e) => setNumToBook(e.target.value)}
                  />
                  <button className="btn btn-success" onClick={bookSeats}>
                    Book
                  </button>
                </div>
                
                <button 
                  className="btn btn-danger w-100" 
                  onClick={cancelBookings}
                >
                  Cancel all Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
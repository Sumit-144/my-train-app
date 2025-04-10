// backend/routes/booking.js
const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/book
 * Body: { seats: number }
 * Requirements:
 *   - Try to book in a single row 
 *   - Otherwise, book nearby seats.
 *   - Use a transaction for concurrency.
 */
router.post('/book', authMiddleware, async (req, res) => {
  const numSeats = parseInt(req.body.seats, 10);
  if (numSeats < 1 || numSeats > 7) {
    return res.status(400).json({ message: 'You can reserve between 1 and 7 seats per booking.' });
  }
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch all seats ordered by row and col
    const seatsResult = await client.query('SELECT id, row_number, col_number, seat_number, status, booked_by FROM seats ORDER BY row_number, col_number FOR UPDATE');
    const seats = seatsResult.rows;

    // Organize seats into a 2D array 
    const train = [];
    for (let r = 0; r < 12; r++) {
      train.push(seats.filter(s => s.row_number === r));
    }

    // Find a contiguous block in a row
    let found = false;
    let bookedSeats = [];
    for (let r = 0; r < train.length; r++) {
      const row = train[r];
      const blockIndex = findContiguousBlock(row, numSeats);
      if (blockIndex !== -1) {
        for (let i = blockIndex; i < blockIndex + numSeats; i++) {
          bookedSeats.push(row[i]);
        }
        found = true;
        break;
      }
    }

    // Look for best nearby seats in a row if contiguous block not found
    if (!found) {
      for (let r = 0; r < train.length; r++) {
        const row = train[r];
        const availableCols = row.filter(s => s.status === 0);
        if (availableCols.length >= numSeats) {
          const bestCluster = findBestCluster(availableCols, numSeats);
          if (bestCluster.length === numSeats) {
            bookedSeats = bestCluster;
            found = true;
            break;
          }
        }
      }
    }

    // Book from multiple rows if none of the previous attempts succeed
    if (!found) {
      for (let r = 0; r < train.length && bookedSeats.length < numSeats; r++) {
        const row = train[r];
        for (let seat of row) {
          if (seat.status === 0 && bookedSeats.length < numSeats) {
            bookedSeats.push(seat);
          }
        }
      }
    }
    
    if (bookedSeats.length < numSeats) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Not enough seats available.' });
    }

    // Mark booked seats with status 1 and associate with the user.
    for (let seat of bookedSeats) {
      await client.query('UPDATE seats SET status = 1, booked_by = $1 WHERE id = $2', [userId, seat.id]);
    }

    await client.query('COMMIT');
    return res.json({ bookedSeats: bookedSeats.map(s => s.seat_number) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  } finally {
    client.release();
  }
});

// Cancel all bookings for current user
router.post('/cancel', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'UPDATE seats SET status = 0, booked_by = NULL WHERE booked_by = $1 RETURNING seat_number',
      [userId]
    );
    res.json({ cancelledSeats: result.rows.map(r => r.seat_number) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
});

// An endpoint to fetch current seating status for display on the homepage.
router.get('/seats', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, row_number, col_number, seat_number, status, booked_by FROM seats ORDER BY row_number, col_number');
    res.json({ seats: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch seats', error: err.message });
  }
});


// Finds the index of a contiguous block in the row array.
// row is an array of seat objects.
function findContiguousBlock(row, numSeats) {
  let count = 0;
  for (let i = 0; i < row.length; i++) {
    if (row[i].status === 0) {
      count++;
    } else {
      count = 0;
    }
    if (count === numSeats) {
      return i - numSeats + 1;
    }
  }
  return -1;
}

// Given an array of available seat objects from a row,
// returns the best cluster of numSeats.
function findBestCluster(availableSeats, numSeats) {
  if (availableSeats.length < numSeats) return [];
  let bestCluster = availableSeats.slice(0, numSeats);
  let minSpread = bestCluster[numSeats - 1].col_number - bestCluster[0].col_number;
  for (let i = 0; i <= availableSeats.length - numSeats; i++) {
    const cluster = availableSeats.slice(i, i + numSeats);
    const spread = cluster[cluster.length - 1].col_number - cluster[0].col_number;
    if (spread < minSpread) {
      minSpread = spread;
      bestCluster = cluster;
    }
  }
  return bestCluster;
}

module.exports = router;

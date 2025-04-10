// client/components/SeatGrid.js
export default function SeatGrid({ seats, currentUserId }) {
    // Group seats by rows (rows 0-11)
    const rows = Array.from({ length: 12 }, (_, rowIndex) =>
      seats.filter((seat) => seat.row_number === rowIndex)
    );
  
    return (
      <div>
        {rows.map((row, idx) => (
          <div key={idx} className="d-flex justify-content-center mb-2">
            {row.map((seat) => {
              // Skip rendering if seat_number is 81
              if (seat.seat_number === 81) return null;
              let bgColor = 'bg-light'; 
              if (seat.status === 1) {
                // Booked seat
                bgColor = seat.booked_by === currentUserId ? 'bg-success' : 'bg-warning';
              } else if (seat.status === 2) {
                // Not available
                bgColor = 'bg-secondary';
              }
              return (
                <div
                  key={seat.id}
                  className={`border text-center ${bgColor}`}
                  style={{ width: '40px', height: '40px', lineHeight: '40px', margin: '2px' }}
                >
                  {seat.seat_number}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
  
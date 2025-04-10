DO $$
DECLARE
  r INT;
  c INT;
  seatNum INT := 1;
BEGIN
  FOR r IN 0..11 LOOP
    FOR c IN 0..6 LOOP
      IF r = 11 AND c >= 3 THEN
        INSERT INTO seats (row_number, col_number, seat_number, status)
        VALUES (r, c, seatNum, 2);
      ELSE
        INSERT INTO seats (row_number, col_number, seat_number, status)
        VALUES (r, c, seatNum, 0);
        seatNum := seatNum + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;

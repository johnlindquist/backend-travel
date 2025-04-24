import { sqliteTable, text, integer, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Custom type for handling JSONB (stored as TEXT)
// You might add validation or parsing logic here if needed
const jsonb = (name: string) => text(name);

// Custom type for handling POINT (stored as TEXT, e.g., 'x,y')
// You might add parsing logic here if needed
const point = (name: string) => text(name);

export const aircraftsData = sqliteTable('aircrafts_data', {
    aircraftCode: text('aircraft_code', { length: 3 }).notNull().primaryKey(),
    model: jsonb('model').notNull(), // Stored as TEXT in SQLite
    range: integer('range').notNull(),
});

export const airportsData = sqliteTable('airports_data', {
    airportCode: text('airport_code', { length: 3 }).notNull().primaryKey(),
    airportName: jsonb('airport_name').notNull(), // Stored as TEXT
    city: jsonb('city').notNull(), // Stored as TEXT
    coordinates: point('coordinates').notNull(), // Stored as TEXT
    timezone: text('timezone').notNull(),
});

export const bookings = sqliteTable('bookings', {
    bookRef: text('book_ref', { length: 6 }).notNull().primaryKey(),
    // Using integer for timestamp with time zone, assuming Unix timestamp (seconds)
    bookDate: integer('book_date', { mode: 'timestamp_ms' }).notNull(),
    // Using text for numeric to preserve precision
    totalAmount: text('total_amount').notNull(),
});

export const flights = sqliteTable('flights', {
    flightId: integer('flight_id').notNull().primaryKey(),
    flightNo: text('flight_no', { length: 6 }).notNull(),
    scheduledDeparture: integer('scheduled_departure', { mode: 'timestamp_ms' }).notNull(),
    scheduledArrival: integer('scheduled_arrival', { mode: 'timestamp_ms' }).notNull(),
    departureAirport: text('departure_airport', { length: 3 }).notNull(),
    arrivalAirport: text('arrival_airport', { length: 3 }).notNull(),
    status: text('status', { length: 20 }).notNull(),
    aircraftCode: text('aircraft_code', { length: 3 }).notNull(), //.references(() => aircraftsData.aircraftCode), // FK relationships might need manual setup or are handled by application logic
    actualDeparture: integer('actual_departure', { mode: 'timestamp_ms' }),
    actualArrival: integer('actual_arrival', { mode: 'timestamp_ms' }),
});

export const tickets = sqliteTable('tickets', {
    ticketNo: text('ticket_no', { length: 13 }).notNull().primaryKey(),
    bookRef: text('book_ref', { length: 6 }).notNull(), //.references(() => bookings.bookRef),
    passengerId: text('passenger_id', { length: 20 }).notNull(),
    // Consider adding passenger name/contact info if needed, though not in original schema
    // passengerName: text('passenger_name'),
    // contactData: jsonb('contact_data'), // Stored as TEXT
});


export const ticketFlights = sqliteTable('ticket_flights', {
    ticketNo: text('ticket_no', { length: 13 }).notNull(), //.references(() => tickets.ticketNo),
    flightId: integer('flight_id').notNull(), //.references(() => flights.flightId),
    fareConditions: text('fare_conditions', { length: 10 }).notNull(),
    amount: text('amount').notNull(), // Using text for numeric
}, (table) => ({
    pk: primaryKey({ columns: [table.ticketNo, table.flightId] }),
}));


export const boardingPasses = sqliteTable('boarding_passes', {
    ticketNo: text('ticket_no', { length: 13 }).notNull(),
    flightId: integer('flight_id').notNull(),
    boardingNo: integer('boarding_no').notNull(),
    seatNo: text('seat_no', { length: 4 }).notNull(),
}, (table) => ({
    // Define composite primary key based on observed constraints/common practice
    // Although not explicitly defined in .schema, (ticket_no, flight_id) is likely unique for boarding pass context.
    // Drizzle requires a primary key for updates/deletes. Adjust if DB has a different implicit key.
    // Update: The original schema doesn't explicitly state a PK. A common pattern is (ticket_no, flight_id) being unique *within* boarding passes.
    // Let's assume (ticket_no, flight_id) acts as the logical key for relating back,
    // but Drizzle might need *a* primary key. If errors occur, consider adding a rowid or similar.
    // For now, we define it based on the most likely unique combination for a single boarding pass.
    // If the DB has constraints like UNIQUE(ticket_no, flight_id), this primaryKey definition might conflict.
    // Let's make boarding_no the primary key assuming it's unique per flight.
    // Revisit if introspection or usage reveals issues.
    // pk: primaryKey({ columns: [table.ticketNo, table.flightId] }) <-- Likely conflicts if not PK in DB
    // Let's try making boarding_no the PK, assuming it's unique per flight? Seems unlikely globally.
    // Safest bet might be to treat (ticket_no, flight_id) as the unique identifier pair for operations,
    // but Drizzle needs *something* defined as primaryKey. Let's use the pair as PK.
    pk: primaryKey({ columns: [table.ticketNo, table.flightId] }),

    // Explicitly add foreign key references if needed, though Drizzle doesn't enforce them at DB level for SQLite wrappers like this
    // ticketFlightFk: foreignKey({
    //     columns: [table.ticketNo, table.flightId],
    //     foreignColumns: [ticketFlights.ticketNo, ticketFlights.flightId]
    // }),
    // seatFk: foreignKey({ // Needs seats table defined first
    //     columns: [table.seatNo, /* Need aircraft code */ ],
    //     foreignColumns: [seats.seatNo, seats.aircraftCode]
    // })

}));

// Note: The 'seats' table definition was missing from the prompt's schema dump initially.
// Adding it based on the foreign key reference in boarding_passes and common sense.
// If 'seats' table doesn't exist, remove this or adjust accordingly.
export const seats = sqliteTable('seats', {
    aircraftCode: text('aircraft_code', { length: 3 }).notNull(), //.references(() => aircraftsData.aircraftCode),
    seatNo: text('seat_no', { length: 4 }).notNull(),
    fareConditions: text('fare_conditions', { length: 10 }).notNull(),
}, (table) => ({
    // Define composite primary key
    pk: primaryKey({ columns: [table.aircraftCode, table.seatNo] }),
}));

// --- Notes on Schema Definition ---
// 1. Timestamps: Assumed 'timestamp with time zone' fields store Unix timestamps (seconds or ms). Used integer({ mode: 'timestamp_ms' }). Verify actual storage format. If strings (ISO 8601), use `text()`.
// 2. JSONB/POINT: Mapped to `text()`. Parsing/validation logic might be needed in application layer.
// 3. Numeric: Mapped to `text()` to avoid precision issues with JavaScript numbers. Convert as needed in application layer.
// 4. Primary Keys: Defined based on schema dump and common sense (e.g., *_code, *_id, *_ref, *_no). Composite keys defined where appropriate (e.g., ticket_flights, boarding_passes, seats).
// 5. Foreign Keys: Commented out `.references()` for now. Drizzle doesn't manage FK constraints directly with this driver setup. Relationships are mainly for type safety and ORM query building. Define explicitly if needed for ORM features.
// 6. Constraints: CHECK constraints (e.g., `aircrafts_range_check`) are not represented in Drizzle schema but exist in the DB. 
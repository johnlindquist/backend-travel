import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { db } from '../db/index'; // Import drizzle instance
import * as schema from '../db/schema'; // Import all schemas

// Define Zod schema for the booking data in the response
export const BookingSchema = z.object({
    bookRef: z.string().length(6).openapi({ example: 'ABCDEF' }),
    // Represent timestamp as ISO 8601 string in the API response
    bookDate: z.string().datetime().openapi({ example: '2024-01-15T10:30:00Z' }),
    // Keep totalAmount as string to preserve precision from DB's TEXT type
    totalAmount: z.string().openapi({ example: '55000.00' }),
}).openapi('Booking'); // Name the schema for OpenAPI docs

// Define the OpenAPI route for getting all bookings
export const getAllBookingsRoute = createRoute({
    method: 'get',
    path: '/', // Base path relative to where this router will be mounted
    responses: {
        200: {
            description: 'List of all bookings',
            content: {
                'application/json': {
                    // Response is an array of Booking objects
                    schema: z.array(BookingSchema),
                },
            },
        },
    },
    // Optional: Add tags for grouping in Swagger UI
    tags: ['Bookings'],
});

// Create a new Hono app specific to bookings
const bookingsApp = new OpenAPIHono();

// Implement the GET all bookings route handler
bookingsApp.openapi(getAllBookingsRoute, async (c) => {
    const bookingsData = await db.select({
        bookRef: schema.bookings.bookRef,
        bookDate: schema.bookings.bookDate, // Select the raw timestamp
        totalAmount: schema.bookings.totalAmount,
    }).from(schema.bookings);

    // Format the data for the API response
    const bookings = bookingsData.map(booking => ({
        ...booking,
        // Convert timestamp (assuming it's a JavaScript Date object from Drizzle) to ISO string
        bookDate: booking.bookDate.toISOString(),
        // totalAmount is already string, no conversion needed here
    }));

    return c.json(bookings);
});

export default bookingsApp; // Export the Hono app for bookings 
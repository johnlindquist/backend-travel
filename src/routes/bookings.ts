import { z } from '@hono/zod-openapi';

// Define Zod schema for the booking data in the response
export const BookingSchema = z.object({
    bookRef: z.string().length(6).openapi({ example: 'ABCDEF' }),
    // Represent timestamp as ISO 8601 string in the API response
    bookDate: z.string().datetime().openapi({ example: '2024-01-15T10:30:00Z' }),
    // Keep totalAmount as string to preserve precision from DB's TEXT type
    totalAmount: z.string().openapi({ example: '55000.00' }),
}).openapi('Booking'); // Name the schema for OpenAPI docs

// (More code will be added to this file in subsequent steps) 
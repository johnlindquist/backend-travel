import { Hono } from 'hono';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { db } from '../db'; // Adjust path as necessary
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

// Define Zod schemas for the flight data
const FlightSchema = z.object({
    flightId: z.number().int().openapi({ example: 1 }),
    flightNo: z.string().openapi({ example: 'PG0001' }),
    scheduledDeparture: z.string().datetime().openapi({ example: '2024-08-15T10:00:00Z' }),
    scheduledArrival: z.string().datetime().openapi({ example: '2024-08-15T13:00:00Z' }),
    departureAirport: z.string().length(3).openapi({ example: 'SVO' }),
    arrivalAirport: z.string().length(3).openapi({ example: 'LED' }),
    status: z.string().openapi({ example: 'Scheduled' }),
    aircraftCode: z.string().length(3).openapi({ example: '733' }),
    actualDeparture: z.string().datetime().nullable().openapi({ example: null }),
    actualArrival: z.string().datetime().nullable().openapi({ example: null }),
});

const ParamsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: 'id',
            in: 'path',
        },
        example: '123',
        description: 'Flight ID'
    })
})

// Define the OpenAPI route for getting all flights
const getAllFlightsRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            description: 'List of all flights',
            content: {
                'application/json': {
                    schema: z.array(FlightSchema),
                },
            },
        },
    },
});

// Define the OpenAPI route for getting a single flight by ID
const getFlightByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: ParamsSchema
    },
    responses: {
        200: {
            description: 'Single flight details',
            content: {
                'application/json': {
                    schema: FlightSchema,
                },
            },
        },
        404: {
            description: 'Flight not found',
        },
    },
});


// Create a new Hono app specific to flights
const flightsApp = new OpenAPIHono();

// Implement the GET all flights route handler
flightsApp.openapi(getAllFlightsRoute, async (c) => {
    // Convert integer timestamps from DB to ISO strings for the response
    const flightsData = await db.select().from(schema.flights);
    const flights = flightsData.map(flight => ({
        ...flight,
        // Convert timestamps (assuming stored as ms since epoch) to ISO strings
        scheduledDeparture: new Date(flight.scheduledDeparture).toISOString(),
        scheduledArrival: new Date(flight.scheduledArrival).toISOString(),
        actualDeparture: flight.actualDeparture ? new Date(flight.actualDeparture).toISOString() : null,
        actualArrival: flight.actualArrival ? new Date(flight.actualArrival).toISOString() : null,
    }));
    return c.json(flights);
});

// Implement the GET flight by ID route handler
flightsApp.openapi(getFlightByIdRoute, async (c) => {
    const { id } = c.req.valid('param');
    const flightId = parseInt(id, 10);

    if (isNaN(flightId)) {
        return c.json({ error: 'Invalid flight ID' }, 400);
    }

    const flightData = await db.select().from(schema.flights).where(eq(schema.flights.flightId, flightId)).limit(1);

    if (!flightData || flightData.length === 0) {
        return c.json({ error: 'Flight not found' }, 404);
    }

    const flight = flightData[0];
    const response = {
        ...flight,
        scheduledDeparture: new Date(flight.scheduledDeparture).toISOString(),
        scheduledArrival: new Date(flight.scheduledArrival).toISOString(),
        actualDeparture: flight.actualDeparture ? new Date(flight.actualDeparture).toISOString() : null,
        actualArrival: flight.actualArrival ? new Date(flight.actualArrival).toISOString() : null,
    };

    return c.json(response);
});


export default flightsApp; 
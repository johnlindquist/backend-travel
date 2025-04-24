import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import flightsApp from './routes/flights'; // Import the flights router

// Use OpenAPIHono for the main app to support OpenAPI features
const app = new OpenAPIHono();

// Mount the flights router under the /flights path
app.route('/flights', flightsApp);

// Basic root route (optional, kept from initial setup)
app.get('/', (c) => {
    return c.text('Hello Hono! Base API endpoint.');
});

// --- OpenAPI Documentation Setup ---

// The /doc endpoint serves the OpenAPI specification (JSON)
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'Travel API',
        description: 'API for querying travel booking data.',
    },
});

// The /ui endpoint serves the Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }));

// --- Server Export ---
// Use the default export format expected by Bun/Node adapters
export default {
    port: 3000, // Default port
    fetch: app.fetch,
};

console.log('Server setup complete. Ready to run.');
console.log('Swagger UI available at /ui');
console.log('OpenAPI Spec available at /doc'); 
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server'; // Import serve
import detectPort from 'detect-port'; // Import detect-port
import flightsApp from './routes/flights'; // Import the flights router

// Database connection happens implicitly when db module is imported
// Ensure db logs happen before server start logs
import '../db';

const DEFAULT_PORT = 3000;

async function startServer() {
    const port = await detectPort(DEFAULT_PORT);

    if (port !== DEFAULT_PORT) {
        console.warn(`WARN: Port ${DEFAULT_PORT} was occupied, using ${port} instead.`);
    }

    // Use OpenAPIHono for the main app
    const app = new OpenAPIHono();

    // Mount the flights router
    app.route('/flights', flightsApp);

    // Basic root route
    app.get('/', (c) => {
        return c.text('Hello Hono! Base API endpoint.');
    });

    // --- OpenAPI Documentation Setup ---
    app.doc('/doc', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Travel API',
            description: 'API for querying travel booking data.',
        },
    });

    app.get('/ui', swaggerUI({ url: '/doc' }));

    // --- Start Server ---
    serve({
        fetch: app.fetch,
        port: port,
    }, (info) => {
        // Updated logs using the actual detected port
        console.log(`Server listening on http://localhost:${info.port}`);
        console.log(`Swagger UI available at http://localhost:${info.port}/ui`);
        console.log(`OpenAPI Spec available at http://localhost:${info.port}/doc`);
    });

    // Remove old export style
    // export default serverConfig;
}

// Start the server
startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

// Remove previous logging outside the serve callback
// console.log(`Server listening on http://localhost:${serverConfig.port}`);
// console.log(`Swagger UI available at http://localhost:${serverConfig.port}/ui`);
// console.log(`OpenAPI Spec available at http://localhost:${serverConfig.port}/doc`); 
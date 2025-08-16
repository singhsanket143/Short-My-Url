import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { initRedis } from './config/redis';
import { connectDB } from './config/db';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { trpcRouter } from './routers/trpc';
import { redirectUrl } from './controllers/url.controller';
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);


app.use('/trpc', createExpressMiddleware({
    router: trpcRouter
}))

app.get('/:shortUrl', redirectUrl)

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    await initRedis();

    await connectDB();
});

import express, { NextFunction, Request, Response } from 'express';
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
import { UrlService } from './services/url.service';
import { UrlRepository } from './repositories/url.repository';
import { CacheRepository } from './repositories/cache.repository';
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);


app.use('/trpc', createExpressMiddleware({
    router: trpcRouter
}))

app.get('/:shortUrl', async (req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;

    const urlService = new UrlService(new UrlRepository(), new CacheRepository());

    const url = await urlService.getOriginalUrl(shortUrl);

    if(!url) {
        res.status(404).json({
            success: false,
            message: 'URL not found'
        });
        return;
    }

    await urlService.incrementClicks(shortUrl);

    res.redirect(url.originalUrl);
})

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

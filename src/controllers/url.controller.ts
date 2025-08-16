import { z } from "zod";
import { publicProcedure } from "../routers/trpc/context";
import { UrlService } from "../services/url.service";
import { InternalServerError } from "../utils/errors/app.error";
import logger from "../config/logger.config";
import { UrlRepository } from "../repositories/url.repository";
import { CacheRepository } from "../repositories/cache.repository";
import { NextFunction, Request, Response } from "express";


const urlService = new UrlService(new UrlRepository(), new CacheRepository());

export const urlController = {
    create: publicProcedure
    .input(
        z.object({
            originalUrl: z.string().url('Invalid URL')
        })
    )
    .mutation(async ({ input }) => {
        try {
            const result = await urlService.createShortUrl(input.originalUrl);
            return result;
        } catch (error) {
            logger.error('Error creating short URL', error);
            throw new InternalServerError('Failed to create short URL');
        }
    }),

    getOriginalUrl: publicProcedure
    .input(z.object({
        shortUrl: z.string().min(1, 'Short URL is required')
    }))
    .query(async ({ input }) => {
        try {
            const result = await urlService.getOriginalUrl(input.shortUrl);
            return result;
        } catch (error) {
            logger.error('Error getting original URL', error);
            throw new InternalServerError('Failed to get original URL');
        }
    }),

    
}

export async function redirectUrl(req: Request, res: Response, next: NextFunction) {
    const { shortUrl } = req.params;

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
}
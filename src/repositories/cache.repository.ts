import { serverConfig } from "../config";
import { redisClient } from "../config/redis";
export class CacheRepository {

    async getNextId() : Promise<number> {
        const key = serverConfig.REDIS_COUNTER_KEY;
        if(!redisClient.isOpen) {
            await redisClient.connect();
        }

        const result = await redisClient.incr(key);
        return result;
    }

    async setUrlMapping(shortUrl: string, originalUrl: string) {
        const key = `url:${shortUrl}`;
        if(!redisClient.isOpen) {
            await redisClient.connect();
        }

        await redisClient.set(key, originalUrl, { EX: 86400 });
        return;
    }

    async getUrlMapping(shortUrl: string) : Promise<string | null> {
        const key = `url:${shortUrl}`;
        if(!redisClient.isOpen) {
            await redisClient.connect();
        }

        const result = await redisClient.get(key);
        return result;
    }

    async deleteUrlMapping(shortUrl: string) {
        const key = `url:${shortUrl}`;
        if(!redisClient.isOpen) {
            await redisClient.connect();
        }

        await redisClient.del(key);
        return;
    }
}
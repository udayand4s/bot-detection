import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      username: 'default',
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST || '',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined
      },
    });

      redisClient.on('error', (err) => console.error('Redis error:', err));

      await redisClient.connect();
      console.log('Redis connected');
      return redisClient;
  } catch (error) {
      console.error('Redis connection failed:', error);
      redisClient = null;
      return null;
    }
}

export default getRedisClient;

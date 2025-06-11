import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      username: 'default',
      password: 'IKmIPHgxUiBtsvCro82UuVdZOizDVjBV',
      socket: {
        host: 'redis-18373.crce206.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18373,
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

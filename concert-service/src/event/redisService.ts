import {
  redisStreamOperations,
  CHANNELS,
  logger,
  getRedisClient,
  redisClient_lib,
} from "@concert/shared";
import concertService from "../service/concertService";

type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;

class RedisService {
  private client!: RedisClientType | null;
  private isInitialized: boolean = false;
  private static instance: RedisService;

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }
  public getRedisClient() {
    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }
    return this.client;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start listening for responses

      this.client = await getRedisClient();
      this.isInitialized = true;
      await this.initializeResponseListener();
    } catch (error) {
      logger.error("Failed to initialize Redis service:", error);
      throw error;
    }
  }

  private async initializeResponseListener(): Promise<void> {
    const requestStreamRead = `${CHANNELS.CONCERT.READED}:requests`;
    const responseStreamRead = `${CHANNELS.CONCERT.READED}:responses`;

    const processResponseRead = async () => {
      try {
        const messages = await redisStreamOperations.readFromStream(
          requestStreamRead,
          "0-0"
        );
        for (const msg of messages) {
          try {
            const { userId, concertId, seatType } = msg.data as {
              userId: string;
              concertId: string;
              seatType: string;
            };
            const consert = await concertService.findById(concertId);
            const message = {
              concert: consert,
              requestId: msg.id,
            };
            await redisStreamOperations.publishToStream(
              responseStreamRead,
              message
            );
          } catch (error) {
            logger.error("Error processing response:", error);
          }
        }
      } catch (error) {
        logger.error("Error in response listener:", error);
      }
    };
    logger.info(`Started response listener on stream: ${requestStreamRead}`);
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      processResponseRead();
    }
  }
}

const redisService = RedisService.getInstance();

export { redisService, RedisService };

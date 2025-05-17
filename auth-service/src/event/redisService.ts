import { redisStreamOperations, CHANNELS, logger, getRedisClient, redisClient_lib, } from '@concert/shared';
import { AuthService } from '../services/authService';
type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;

class RedisService {
  private static instance: RedisService;
  private isInitialized: boolean = false;
  public client!: RedisClientType | null;

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getClient() {
    if(!this.client){
        throw Error ('Redis client is not initialized');
      }
    return this.client;
  }
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Start listening for responses
      await this.initializeResponseListener();
     

    } catch (error) {
      logger.error('Failed to initialize Redis service:', error);
      throw error;
    }
  }


  private async initializeResponseListener(): Promise<void> {

    const requestStream = `${CHANNELS.AUTH.TOKEN_VALIDATION}:requests`;
    const responseStream = `${CHANNELS.AUTH.TOKEN_VALIDATION}:responses`;

    const processResponse = async () => {
      try {
        const messages = await redisStreamOperations.readFromStream(requestStream, '0-0');
        console.log(" data out message authen : ",messages);
        for (const msg of messages) {
          try {
            const response = msg.data;
            const authService = await AuthService.getInstance();
            const isvalid = await authService.validateToken(response.toString());
            const message = {
              isvalid: isvalid.success,
              user: isvalid.data,
              requestId: msg.id,
            }
            await redisStreamOperations.publishToStream(responseStream, message);
          } catch (error) {
            logger.error('Error processing response:', error);
          }
        }
      } catch (error) {
        logger.error('Error in response listener:', error);
      }

    };
    logger.info(`Started response listener on stream: ${responseStream}`);
    while(true)
    {
      await new Promise(resolve => setTimeout(resolve, 50));
        processResponse();
    }

  }

}

const redisService = RedisService.getInstance();

export { redisService, RedisService };

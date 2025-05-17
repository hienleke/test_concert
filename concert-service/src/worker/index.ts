import { RedisService } from "../event/redisService";
import createOrRestartConcertWorker from "./ConcertExpire";
export async function startWorker() {
  createOrRestartConcertWorker();
  await RedisService.getInstance().initialize();
}

startWorker();

import { RedisService } from "../event/redisService";

export async function startWorker() {
  await RedisService.getInstance().initialize();
}
  
startWorker();

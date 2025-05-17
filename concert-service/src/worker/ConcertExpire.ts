import { tryCatch, Worker } from "bullmq";
import { logger, getRedisClient } from "@concert/shared";
import dotenv from "dotenv";
import path from "path";
import concertService from "../service/concertService";

let concertWorkerInstance: Worker | null = null;
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function createOrRestartConcertWorker() {
  logger.info("Start concert expired worker...");
  if (concertWorkerInstance) {
    logger.info("Closing existing concert worker before creating a new one...");
    try {
      await concertWorkerInstance.close();
      logger.info("Previous concert worker closed successfully");
    } catch (err) {
      logger.error("Error closing previous concert worker:", err);
    }
    concertWorkerInstance = null;
  }

  concertWorkerInstance = new Worker(
    "concertCountDown",
    async (job) => {
      const data = job.data;

      try {
        let redis = await getRedisClient();
        let concert = await concertService.findById(data.concertId);
        let booked = await redis.hGet(
          `concert:${data.concertId}:seats:${data.seatType}`,
          "booked"
        );
        if (concert === null || booked === null) {
          logger.error("Concert or booked data is null");
          return;
        }
        concert.seats.forEach((seat) => {
          if (seat.type === data.seatType) {
            seat.booked = Number(booked);
          }
        });
        await concertService.update(data.concertId, concert);

        logger.info(`Action "${data.action}" processed for ${data.to}`);
      } catch (error) {
        logger.error("Error processing concert countdown job:", error);
      }
    },
    {
      connection: {
        url: process.env.REDIS_URL,
      },
    }
  );

  concertWorkerInstance.on("error", (err) => {
    logger.error("Email worker error:", err);
  });

  concertWorkerInstance.on("completed", (job) => {
    logger.info(`Email job completed for ${job.data.to}`);
  });

  return concertWorkerInstance;
}

export default createOrRestartConcertWorker;

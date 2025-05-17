import { Concert, ConcertInput } from "../models/Concert";
import { ConcertModel } from "../models/Concert";
import { Types } from "mongoose";
import { getRedisClient, redisClient_lib } from "@concert/shared";
import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();
const concertQueue = new Queue("concertCountDown", {
  connection: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
});

type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;
let redisClient: RedisClientType;

export class ConcertService {
  public static instance: ConcertService;

  public static async getInstance(): Promise<ConcertService> {
    if (!ConcertService.instance) {
      ConcertService.instance = new ConcertService();
    }
    return ConcertService.instance;
  }

  async findAll(): Promise<Concert[]> {
    return ConcertModel.find().lean().exec();
  }

  async findAllConcertsAvailable(): Promise<Concert[]> {
    const currentDateTime = new Date();
    return ConcertModel.find({
      date: { $gt: currentDateTime },
    })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<Concert | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConcertModel.findById(id).lean().exec();
  }

  async create(
    data: ConcertInput | ConcertInput[]
  ): Promise<Concert | Concert[]> {
    const concerts = Array.isArray(data) ? data : [data];
    if (!redisClient) {
      redisClient = await getRedisClient();
    }
    const result = await ConcertModel.insertMany(concerts);
    for (const concert of result) {
      for (const seat of concert.seats) {
        const seatKey = `concert:${concert._id}:seats:${seat.type}`;
        const ttl = concert.date.getTime() - Date.now();
        if (ttl < 0) continue;
        await redisClient.hSet(seatKey, {
          total: seat.total,
          booked: seat.booked,
        });
        await redisClient.expire(seatKey, ttl);
        this.addToQueue(String(concert._id), seat.type, ttl);
      }
    }
    return result.map((doc) => doc.toObject());
  }
  async addToQueue(
    concertId: string,
    seatType: string,
    ttl: number
  ): Promise<void> {
    const jobData = {
      concertId,
      seatType,
      action: "book",
    };
    await concertQueue.add("concertCountDown", jobData, {
      delay: ttl - 10,
      attempts: 3,
    });
  }
  async update(
    id: string,
    data: Partial<ConcertInput>
  ): Promise<Concert | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConcertModel.findByIdAndUpdate(id, data, { new: true })
      .lean()
      .exec();
  }

  async updateOne(
    id: string,
    filter: Record<string, any> = {},
    updateDoc: Record<string, any>
  ): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    try {
      const updated = await ConcertModel.updateOne(
        { _id: id, ...filter },
        updateDoc
      );

      return updated;
    } catch (error) {
      console.error(" Error in updateOne:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<Concert | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConcertModel.findByIdAndDelete(id).lean().exec();
  }
}

export default new ConcertService();

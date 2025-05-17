// src/services/bookingService.ts
import { Booking } from "../models/Booking";
import { redisStreamOperations, CHANNELS, getRedisClient, redisClient_lib, runLuaScript } from "@concert/shared";
import { sendEmail } from "./emailService";

type RedisClientType = ReturnType<typeof redisClient_lib.createClient>;
let redisClient: RedisClientType;

export const createBooking = async ({ concertId, seatType, user }: any) => {
  if (!redisClient) {
    redisClient = await getRedisClient();
  }

  const bookedCheck = await redisClient.get(`booking:concert:${concertId}:seat:${user.userId }`);
  if (bookedCheck) {
    throw new Error("User already has a booking for this concert");
  }

  const luaScript = `
    local seatKey = KEYS[1]
    local bookingCount = tonumber(ARGV[1])
    local total = tonumber(redis.call("HGET", seatKey, "total"))
    local booked = tonumber(redis.call("HGET", seatKey, "booked"))
    if not total or not booked then
      return { err = "SEAT_NOT_EXIST" }
    end
    if total - booked >= bookingCount then
      redis.call("HINCRBY", seatKey, "booked", bookingCount)
      return { ok = "BOOKED_SUCCESS" }
    else
      return { err = "SOLD OUT" }
    end
  `;

  const result = await runLuaScript(luaScript, `concert:${concertId}:seats:${seatType}`, "1");

  if (result.err) {
    throw new Error(result.err);
  }

  const booking = new Booking({
    userId: user.userId ,
    concertId,
    seatType,
  });

  // const requestId = await redisStreamOperations.publishToStream(`${CHANNELS.CONCERT.READED}:requests`, booking);
  // const response = await redisStreamOperations.readFromStream(`${CHANNELS.CONCERT.READED}:responses`, requestId);
  // if (response.length === 0) {
  //   throw new Error("Booking not found");
  // }

  const bookingData = await booking.save();

  await redisClient.set(`booking:concert:${concertId}:seat:${user.userId}`, JSON.stringify(booking));

  await sendEmail({
    to: user.email,
    userId: user.userId ,
    userName: user.name,
    concertId,
    seatType,
    action: 'book',
  });

  return bookingData;
};

export const getBookingById = async (id: string) => {
  return await Booking.findById(id);
};

export const getUserBookings = async (userId: string) => {
  return await Booking.find({ userId });
};

export const cancelBooking = async ({ concertId, seatType, user }: any) => {
  if (!redisClient) {
    redisClient = await getRedisClient();
  }
  const key = `booking:concert:${concertId}:seat:${user.id}`
  const booking = await redisClient.get(key);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // TODO: Implement HINCRBY to reduce 'booked' count if necessary
  await redisClient.del(key);
};

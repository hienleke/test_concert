import { Queue } from 'bullmq';
import { logger } from '@concert/shared';
import { EmailOptions } from '../types';
import dotenv from "dotenv";
dotenv.config();
const emailQueue = new Queue('email-queue', {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  }
});

// Hàm gửi job email vào queue
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await emailQueue.add('send-email', options);
    logger.info(`Email job added to queue for ${options.to}`);
  } catch (error) {
    logger.error('Failed to add email job to queue:', error);
    throw new Error('Failed to process email request');
  }
};
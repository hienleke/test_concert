import { tryCatch, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { CHANNELS, redisStreamOperations, logger } from '@concert/shared';
import { Concert } from '../types';
import dotenv from "dotenv";
import path from "path";

let emailWorkerInstance: Worker | null = null;
let  transporter : any ;
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createOrRestartEmailWorker() {
  logger.info('Start email worker...');
  if (emailWorkerInstance) {
    logger.info('Closing existing email worker before creating a new one...');
    try {
      await emailWorkerInstance.close();  
      logger.info('Previous email worker closed successfully');
    } catch (err) {
      logger.error('Error closing previous email worker:', err);
    }
    emailWorkerInstance = null;
  }

  if(!transporter)
  {
    try{
      transporter = nodemailer.createTransport({
        service: process.env.SMTP_HOST,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
    }})
      await transporter.verify();
    }
    catch (error){
      console.error('Transporter verification failed:', error);
    } 

  }

  emailWorkerInstance = new Worker('email-queue', async (job) => {
      const data = job.data;
      const time  = new Date();
    try{
      let subject: string;
      let html: string;
  
      switch (data.action) {
        case 'book':
          subject = 'Concert Booking Confirmation';
          html = `
            <h2>Booking Confirmation</h2>
            <p>Thank you for booking your seats for the concert!</p>
            <p>Seat Type: ${data.seatType}</p>
            <p>User name: ${data.userName}</p>
            <p>Time: ${time}</p>
          `;
          break;
        case 'cancel':
          subject = 'Concert Booking Cancellation';
          html = `
            <h2>Booking Cancellation</h2>
            <p>Your concert booking has been cancelled.</p>
            <p>User name: ${data.userName}</p>
            <p>Time: ${time}</p>
          `;
          break;
        default:
          throw new Error('Invalid action');
      }
  
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: data.to,
        subject,
        html,
      });
    }catch (error) {
      logger.error('Error processing email job:', error);
    }
    logger.info(`Email sent to ${data.to} for action ${data.action}`);
  }, {
    connection: {
      url: process.env.REDIS_URL,
    }
  });

  emailWorkerInstance.on('error', (err) => {
    logger.error('Email worker error:', err);
  });

  emailWorkerInstance.on('completed', (job) => {
    logger.info(`Email job completed for ${job.data.to}`);
  });

  return emailWorkerInstance;
}

export default createOrRestartEmailWorker;

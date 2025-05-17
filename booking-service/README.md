# Booking Service

This is the Booking Service for the Ticket Booking Platform. It handles ticket bookings, including creation, cancellation, and management of bookings.

## Features

- Create new bookings
- View booking details
- View user's bookings
- Cancel bookings
- Integration with Concert and Payment services
- Input validation
- JWT authentication
- MongoDB integration
- Logging with Winston

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Concert Service running
- Payment Service running

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3003
MONGODB_URI=mongodb://localhost:27017/booking-service
JWT_SECRET=your-secret-key
CONCERT_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3004
```

3. Build the project:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Protected Endpoints (Requires Authentication)
- `POST /` - Create a new booking
- `GET /:id` - Get booking by ID
- `GET /user/:userId` - Get all bookings for a user
- `DELETE /:id` - Cancel a booking

## Error Handling

The service includes comprehensive error handling for:
- Invalid input data
- Database errors
- Authentication errors
- Not found errors
- Service communication errors

## Logging

Logs are stored in:
- `error.log` - Error level logs
- `combined.log` - All logs
- Console output during development

## Service Dependencies

This service depends on:
- Concert Service - For checking seat availability and updating seats
- Payment Service - For processing payments and refunds 
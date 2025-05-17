# Concert Service

This is the Concert Service for the Ticket Booking Platform. It handles concert management, including creating, updating, and retrieving concert information.

## Features

- Create, read, update, and delete concerts
- Get available seats for concerts
- Input validation
- JWT authentication
- MongoDB integration
- Logging with Winston

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/concert-service
JWT_SECRET=your-secret-key
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

### Public Endpoints
- `GET /` - Get all concerts
- `GET /:id` - Get concert by ID
- `GET /:id/seats` - Get available seats for a concert

### Protected Endpoints (Admin Only)
- `POST /` - Create a new concert
- `PUT /:id` - Update a concert
- `DELETE /:id` - Delete a concert

## Error Handling

The service includes comprehensive error handling for:
- Invalid input data
- Database errors
- Authentication errors
- Not found errors

## Logging

Logs are stored in:
- `error.log` - Error level logs
- `combined.log` - All logs
- Console output during development 
# Concert Ticket Booking System

A microservices-based concert ticket booking platform with high concurrency support and distributed locking.

## Architecture

The system consists of the following microservices:

1. **API Gateway** (Port 3000)
   - Entry point for all client requests
   - JWT token verification
   - Request routing to appropriate services
   - Rate limiting and security

2. **Auth Service** (Port 3001)
   - User registration and authentication
   - JWT token generation
   - User profile management

3. **Concert Service** (Port 3003)
   - Concert management
   - Seat type management
   - Ticket availability tracking
   - Auto-disable bookings for past concerts with redis ttl

4. **Booking Service** (Port 3002)
   - Ticket booking operations
   - Concurrency control using Redis
   - Booking validation
   - Email confirmation 

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or later
- MongoDB
- Redis

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd concert-booking-system
   ```

2. Install dependencies for each service:
   ```bash
   cd api-gateway && npm install
   cd ../auth-service && npm install
   cd ../concert-service && npm install
   cd ../booking-service && npm install
   ```

3. Create `.env` files in each service directory with appropriate configurations.

4. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Auth Service
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile (requires auth)

### Concert Service
- GET `/api/concerts` - List all concerts
- GET `/api/concerts/:id` - Get concert details
- GET `/api/concerts/:id/seats` - Get available seats
- POST `/api/concerts` - Create a new concert (admin only)
- PUT `/api/concerts/:id` - Update concert (admin only)

### Booking Service
- POST `/api/bookings` - Create a new booking
- GET `/api/bookings/user/:userId` - Get user's bookings
- DELETE `/api/bookings/:id` - Cancel a booking

## Development

### Running Tests
```bash
# Run tests for all services
npm run test

# Run tests for a specific service
cd <service-directory>
npm run test
```

### Load Testing
The system includes load tests using k6. To run the load tests:
```bash
cd load-tests
k6 run booking-test.js
```

## Features

- JWT-based authentication
- Rate limiting
- CORS and security headers
- Distributed locking with Redis
- MongoDB for data persistence
- Docker containerization
- Load testing support
- Mock email notifications
- Auto-disable bookings for past concerts

## Security

- JWT-based authentication
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Secure password hashing
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 
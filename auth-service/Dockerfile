FROM node:18-alpine

WORKDIR /app

# Copy package.json + package-lock.json trong auth-service context
COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]

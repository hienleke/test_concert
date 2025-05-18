FROM node:18-alpine

WORKDIR /app

# Copy shared directory first
COPY shared ./shared

# Then copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "dev"]

FROM node:20-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . .

# Start the bot
CMD ["yarn", "start"]
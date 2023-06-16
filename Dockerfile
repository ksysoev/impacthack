# Define build arguments
ARG NODE_VERSION=14

# Base image
FROM node:${NODE_VERSION}

# Set environment variables
ENV NODE_ENV=development

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
RUN npm install --force

# Start the application
CMD ["npm", "run", "start"]
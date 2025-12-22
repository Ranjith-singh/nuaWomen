# Stage 1: Build Stage
FROM node:19-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first (to leverage Docker layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the project (useful if using TypeScript, Vite, etc.)
# RUN npm run build

# Stage 2: Production Stage
FROM node:19-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Note: Adjust './dist' above to your actual build folder if applicable

# Copy source if you aren't building/transpiling
COPY --from=builder /app .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
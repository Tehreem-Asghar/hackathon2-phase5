# Stage 1: Install dependencies and build the application
FROM node:20-slim AS builder

# Install system dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Accept build arguments for Next.js public variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application
RUN npm run build

# Stage 2: Serve the application with a minimal image
FROM node:20-slim AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/app ./.next/standalone/app

# The Next.js standalone output contains the full app
# If using `output: "standalone"` in next.config.js, the `src/app` path is not usually correct.
# Assuming Next.js output is directly in .next/standalone/ (if output: "standalone" is configured)
# If not using standalone, adjust the COPY command accordingly.
# For a typical Next.js app, the output will be in .next/ and the server runs from there.

# Check next.config.ts for output configuration.
# Assuming default output for now, which runs the 'next start' command
# The entrypoint will usually be at /app/server.js or similar if standalone output is used
# Or just 'next start' which looks for a built app in ./.next/

# If next.config.ts has output: 'standalone', then the built files would be in .next/standalone
# and should be copied over. Let's assume a standard setup for now where `npm run start` works.

# Create a non-root user
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs

EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]

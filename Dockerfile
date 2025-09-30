# Use Bun's official image
FROM oven/bun:1 AS base

# Pass build args for environment
ARG NUXT_UMAMI_HOST
ARG NUXT_UMAMI_ID

# Set environment variables
ENV NUXT_UMAMI_HOST=$NUXT_UMAMI_HOST
ENV NUXT_UMAMI_ID=$NUXT_UMAMI_ID
ENV HOST=0.0.0.0

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lockb .npmrc ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the Nuxt app
# Note: Nuxt 3 uses `.output` by default in production builds
RUN bun run build

# Use a minimal stage for production (optional but recommended)
FROM oven/bun:1 AS runner

WORKDIR /app

# Copy only the necessary artifacts
COPY --from=base /app/.output ./.output
COPY --from=base /app/node_modules ./node_modules

ENV HOST=0.0.0.0
EXPOSE 3000

# Start the server
CMD ["bun", ".output/server/index.mjs"]
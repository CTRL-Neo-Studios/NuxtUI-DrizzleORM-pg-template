FROM node:20-slim

# Use a larger base image to avoid corepack slowness in slim
ARG NUXT_UI_PRO_LICENSE
ARG NUXT_UMAMI_HOST
ARG NUXT_UMAMI_ID
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE
ENV NUXT_UMAMI_HOST=$NUXT_UMAMI_HOST
ENV NUXT_UMAMI_ID=$NUXT_UMAMI_ID

# Install pnpm directly (faster than corepack)
RUN npm install -g pnpm

WORKDIR /app
COPY package*.json .npmrc ./
RUN node --max-old-space-size=8000
COPY . .

RUN pnpm install
RUN pnpm approve-builds
RUN pnpm run build

#COPY /app/.output /app/.output
#COPY /app/node_modules /app/node_modules

ENV HOST 0.0.0.0
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
#CMD ["pnpm", "start"]

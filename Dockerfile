FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./

ENV NODE_ENV="development"
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV="production"

# Args for the build
ARG PUBLIC_HONEYBADGER_KEY
ENV PUBLIC_HONEYBADGER_KEY=$PUBLIC_HONEYBADGER_KEY
ARG PUBLIC_POSTHOG_KEY
ENV PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY
ARG PUBLIC_POSTHOG_HOST
ENV PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST
ARG PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLIC_STRIPE_PUBLISHABLE_KEY

# Env variables for the build, with dummy values.
# These will be replaced by real values at runtime.
ENV SITE_URL="http://localhost:4321"
ENV REVISION="development"
ENV TURSO_DATABASE_URL="file:local.db"
ENV TURSO_AUTH_TOKEN="dummy"
ENV BETTER_AUTH_SECRET="dummy"
ENV BETTER_AUTH_URL="http://localhost:4321"
ENV RESEND_API_KEY="dummy"
ENV KILLBILL_URL="http://127.0.0.1:8080"
ENV KILLBILL_USERNAME="admin"
ENV KILLBILL_PASSWORD="password"
ENV KILLBILL_API_KEY="dummy"
ENV KILLBILL_API_SECRET="dummy"
ENV STRIPE_SECRET_KEY="dummy"
ENV CLOUDFLARE_ACCOUNT_ID="dummy"
ENV CLOUDFLARE_IMAGES_TOKEN="dummy"


RUN yarn build

RUN yarn install --production --frozen-lockfile

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV="production"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

COPY --from=builder --chown=astro:nodejs /app/dist ./dist

USER astro

EXPOSE 4321
ENV PORT=4321
ENV HOSTNAME="0.0.0.0"

CMD ["node", "./dist/server/entry.mjs"]
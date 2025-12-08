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
# Install dependencies only when needed
FROM node:18.13.0-alpine3.17 AS deps
WORKDIR /opt/app
COPY package.json yarn.lock ./
COPY scripts scripts
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile

FROM node:18.13.0-alpine3.17 AS builder
ENV NODE_ENV=production
WORKDIR /opt/app
COPY . .
COPY --from=deps /opt/app/node_modules ./node_modules
# Disable telemetry: https://nextjs.org/telemetry#how-do-i-opt-out
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# Production image, copy all the files and run next
FROM node:18.13.0-alpine3.17 AS runner
RUN addgroup -S -g 1001 radix-non-root-group
RUN adduser -S -u 1001 -G radix-non-root-group radix-non-root-user
USER 1001
ARG X_TAG
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=builder /opt/app/next.config.js ./
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/.next ./.next
COPY --from=builder /opt/app/node_modules ./node_modules
CMD ["node_modules/.bin/next", "start"]


#
# ---- Base Node ----
FROM node:alpine3.10 AS base

RUN apk add --no-cache tini

WORKDIR /job

COPY package.json .
COPY yarn.lock .



# ---- Build ----
FROM base AS build
COPY . .
RUN yarn add --dev typescript
RUN yarn build


#
# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=build /job/node_modules ./node_modules
# copy app sources
COPY --from=build /job/dist .
COPY config.production.env .
RUN ln -sf /dev/stdout /var/log/ScraperMicroService-debug.log && ln -sf /dev/stderr /var/log/ScraperMicroService-error.log
CMD ["tini", "yarn", "start:prod"]

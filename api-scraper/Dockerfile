#
# ---- Base Node ----
FROM node:alpine3.10 AS base

RUN apk add --no-cache tini

WORKDIR /api

COPY package.json .
COPY yarn.lock .



# ---- Build ----
FROM base AS build
COPY . .
RUN yarn install
RUN yarn build


#
# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=build /api/node_modules ./node_modules
# copy app sources
COPY --from=build /api/dist .
COPY config.production.env .


CMD ["tini", "yarn", "start:prod"]

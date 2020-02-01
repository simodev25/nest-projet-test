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
RUN yarn build

RUN ls

#
# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=build /job/node_modules ./node_modules
# copy app sources
COPY --from=build /job/dist .
COPY config.production.env .
CMD ["tini", "yarn", "start:prod"]

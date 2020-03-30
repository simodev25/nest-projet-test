#
# ---- Base Node ----
FROM node:alpine3.10 AS base

RUN apk add --no-cache tini udev ttf-freefont chromium git

WORKDIR /job

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
COPY --from=build /job/node_modules ./node_modules
# copy app sources
COPY --from=build /job/dist .
COPY config.production.env .
ENV PUPPETEER_CHROMIUM_REVISION '80.0.3987.0'
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

CMD ["tini", "yarn", "start:prod"]

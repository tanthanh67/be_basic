# syntax=docker/dockerfile:1

ARG NODE_VERSION=26.13.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Include the OpenAPI schemas and YAML files under src/docs in the backend image.
COPY --chown=node:node index.js ./
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

CMD ["node", "index.js"]

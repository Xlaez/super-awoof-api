FROM node:alpine AS build

WORKDIR /usr/src/super_awoof_server

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

COPY package.json yarn.lock ./

RUN npm install --legacy-peer-deps --include=dev && npm install --global @dolphjs/cli && \
    npm cache clean --force && \
    rm -rf /tmp/*

COPY . .

# RUN npm run build

# Stage 2

FROM node:alpine

WORKDIR /usr/src/super_awoof_server

COPY --from=build /usr/src/super_awoof_server .

COPY --from=build /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=build /usr/local/bin /usr/local/bin

ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

EXPOSE 8088

CMD ["npm", "run", "dev:start"]
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY server.js .
COPY plants.json .
COPY plots.json .

EXPOSE 3001

CMD [ "node", "server.js" ]
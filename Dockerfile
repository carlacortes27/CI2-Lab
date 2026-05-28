FROM node:22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-17-jdk \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm ci --prefix server \
  && npm ci --prefix client

COPY . .

RUN npm run build --prefix client

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "start", "--prefix", "server"]

FROM node:21

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

COPY tsconfig.json ./

COPY . .

RUN npm install -g pnpm
RUN pnpm install

RUN npx prisma generate

EXPOSE 3000
EXPOSE 3001

CMD npx prisma migrate deploy && npx prisma db seed && pnpm start

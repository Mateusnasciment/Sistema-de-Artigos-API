FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json nest-cli.json init.sh ./
COPY src ./src/

RUN npm ci

RUN npx prisma generate

RUN npm run build

RUN ls -la dist/src/ || echo "dist/src folder not found"

RUN chmod +x init.sh

EXPOSE 3000

CMD ["./init.sh"]

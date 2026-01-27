FROM node:20-alpine

WORKDIR /app

# Copy only package files first (better caching)
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Now copy source
COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/src/app.js"] # Point it to src because I can't make the rootDir "src" due to prisma

FROM node:18-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package*.json .
RUN npm i

COPY . .

EXPOSE 3001
RUN npm run build

CMD ["npm", "run", "start"]

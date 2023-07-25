FROM node:20-alpine3.18

WORKDIR /app

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install --force

COPY . ./

CMD ["npm", "start"]
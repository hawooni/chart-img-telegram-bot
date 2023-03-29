FROM node:18

WORKDIR /chart-img-telegram-bot

COPY . .

RUN npm install npm --location=global
RUN npm install

CMD npm run start

FROM node:8

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 9010

ENV MONGODB_URI="mongodb://mongo-availability:27017/availability-microservice"

CMD [ "npm", "start" ]
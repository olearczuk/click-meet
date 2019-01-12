FROM node:8

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 8080

ENV MONGODB_URI="mongodb://mongo-users:27017/users-microservice"

CMD [ "npm", "start" ]
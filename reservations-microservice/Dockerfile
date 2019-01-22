FROM node:8

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 9010

ENV MONGODB_URI="mongodb://mongo-reservations:27017/reservations-microservice"
ENV USERS_URL="http://users-microservice:8080/"
ENV AVAILABILITY_URL="http://availability-microservice:9010/"
ENV REDIS="redis"
ENV RABBITMQ_URI="amqp://user:pass@rabbit:5672/vhost"

CMD [ "npm", "start" ]
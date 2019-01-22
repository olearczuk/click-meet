FROM node:8

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

ENV RABBITMQ_URI="amqp://user:pass@rabbit:5672/vhost"

CMD [ "npm", "start" ]
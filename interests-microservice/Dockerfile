FROM node:8

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 9010

ENV MONGODB_URI="mongodb://mongo-interests:27017/interests-microservice"

CMD [ "npm", "start" ]
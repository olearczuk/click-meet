const amqp = require('amqplib/callback_api');
const q = 'hello';

let aux;
function amqpConnect() {
    amqp.connect(process.env.RABBITMQ_URI || config.rabbitmqURI, (err, conn) => {
        if (err) {
            console.log('Failed to connect to rabbitmq', err);
            setTimeout(amqpConnect, 5000);
        }
        else {
            console.log('Successfully connected to rabbitmq');

            conn.createChannel((err, ch) => {
                ch.assertQueue(q, { durable: false });
                aux = ch;
            });
        }
    });
}

amqpConnect();

function send(message) {
    aux.sendToQueue(q, Buffer.from(JSON.stringify(message)));
}  

module.exports = {
    send,
} 
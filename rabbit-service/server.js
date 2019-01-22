const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

const q = 'hello';

const my_mail = 'click.meet.service@gmail.com'
const my_pass = 'click-meet-password'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: my_mail,
        pass: my_pass,
    }
})

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
                ch.consume(q, msg => {
                    json = JSON.parse(msg.content.toString());
                    console.log('Received message ', json);

                    let mailOptions = {
                        from: my_mail,
                        to: json.email,
                        subject: 'Click&Meet update',
                        text: json.text,
                    }

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err)
                            console.log(err);
                        else
                            console.log('Email sent: ', info.response);
                    });

                }, { noAck: false })
            });
        }
  });
}

amqpConnect();
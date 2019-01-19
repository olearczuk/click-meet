# Reservations microservice
Microservice used to handle reservations activity

## Reservations microservice APi ( http://0.0.0.0:9030 )
| Method | Route | Arguments | Decription 
| :---: | :---: | :---: | :---: |
| PUT | /student | professorId, startTime, endTime, topic | id |
| PUT | /professor | startTime, endTime | id |
| GET | /:id | - | reservation info |
| DELETE | /:id | - | deletes reservation |
| GET | /professor/:professorId | - | professor's reservations info |
| GET | /personal | - | user's reservations info |
| GET | / | startTime, endTime | busy professors in given time |

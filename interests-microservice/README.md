# Interests microservice
Microservice used to handle interests activity

## Interests microservice APi ( http://0.0.0.0:9020 )
| Method | Route | Arguments | Decription 
| :---: | :---: | :---: | :---: |
| POST | / | title | id |
| GET | / | - | returns all interests |
| GET | /professors | professorIds | returns professors' interests |
| GET | /search/:title | - | professors with such interest |
| DELETE | /:id | - | deletes interest for current professor |

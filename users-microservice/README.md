# Users microservice
Microservice used to handle users authentication and authorization

## Users microservice APi ( http://0.0.0.0:8080 )
| Method | Route | Arguments | Decription 
| :---: | :---: | :---: | :---: |
| POST | /register | username, password, email, professor | creates new user |
| POST | /login | username, password | authenticates + creates session |
| POST | /logout | - | destroys session |
| GET | /id/info | - | user's username and type (professor/student) |
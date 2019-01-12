# Availability microservice
Microservice used to handle availability activity

## Users microservice APi ( http://0.0.0.0:9010 )
| Method | Route | Arguments | Decription 
| :---: | :---: | :---: | :---: |
| GET | /professor/:professorId | - | availability of professor |
| PUT | / | day, start_hour, end_hour | creates availability for professor |
| GET | / | day, start_hour, end_hour | professors available in given time |
| DELETE | / | ids | deletes availability |
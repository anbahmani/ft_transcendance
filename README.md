<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
## WIP

<p>
/Spectate
</P>
<p>
-> Spectator mode paddle position lagging

</p>
<p>
/Friends
</p>
<p>
-> Friend Profile needs to auto-update when Friendship status change

</p>
<p>
/Gamecustom
</p>
<p>
-> Need to add invite player button
</p>
<p>
-> Need to add power ups (to be taken with paddles)
</p>
<p>
-> Need to add obstacles ?
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## FOR MAC

-> if you have permission issues, check the .docker, docker can't access it without permissions
-> JUST CHMOD AT 777


## Docker
-> install [docker](https://docs.docker.com/engine/install/debian/) & [docker-compose](https://docs.docker.com/compose/install/linux/)

Execute the Docker command without sudo :
```bash
$ sudo usermod -aG docker ${USER} //add your name to docker groupe
```
Add you user to www-data group :
```bash
$ sudo usermod -aG www-data ${USER} 
```
## ACCESS
<p>
http://localhost:3000/graphql to access the NestJS application trough graphql
</p>
<p>
http://localhost:5050 to access the PgAdmin
</p>
<p>
http://localhost:3000 to access the NestJS application
</p>

## ENV

exemple .env :

POSTGRES_DB=nest
POSTGRES_USER=boss
POSTGRES_PASSWORD=bosspw

PORT=3000

API_APP_ID=------------------------------------------
API_APP_SECRET=--------------------------------------
API_APP_URL=https://api.intra.42.fr

JWT_KEY=dev
JWT_SECRET=cjaksbvhjafvgjfasjcfdtyasvfd4sv57fd4sv6fs4v896r4e6w1a3zas1v38ew4vwe1v35r1wev53rew
JWT_EXPIRES=365d

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run dev

-> by using turbo i can launch react and nestjs app on the same time 
refer to  -> https://www.youtube.com/watch?v=nY0R7pslbCI&t=640s
          -> https://vitejs.dev/guide/

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

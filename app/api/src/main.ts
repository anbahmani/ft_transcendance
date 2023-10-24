import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const cookieParser = require("cookie-parser");

  app.enableCors({
    credentials:true,
    origin: '*',
  });
  app.useStaticAssets(join(__dirname, '..','..','..','client', 'dist'), {
    index: false,
    prefix: '/public',
  });
  app.use(cookieParser(process.env.JWT_SECRET));
  app.use(graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10 }));
  await app.listen(3000);

  app.enableShutdownHooks();
}
bootstrap();
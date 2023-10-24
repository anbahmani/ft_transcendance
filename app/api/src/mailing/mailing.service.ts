import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class MailingService {
    constructor(
        private readonly configService: ConfigService,
      ) {}
      nodemailer = require("nodemailer");

      async setTransport(data) {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
          this.configService.get('GMAIL_ID_CLIENT'),
          this.configService.get('GMAIL_SECRET'),
          'https://developers.google.com/oauthplayground',
          );
          console.log("transport");
          oauth2Client.setCredentials({
            refresh_token: this.configService.get('GMAIL_REFRESH_TOKEN'),
          });
          console.log("------");
          console.log(oauth2Client);
          const accessToken: string = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
              if (err) {
                reject('Failed to create access token');
                console.log(err);
              }
              resolve(token);
            });
          });
          console.log("transport2 ");
        const config = this.nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: this.configService.get('GMAIL_EMAIL'),
              accessToken: accessToken,
              clientId: this.configService.get('GMAIL_ID_CLIENT'),
              clientSecret: this.configService.get('GMAIL_SECRET'),
              refresh_token: this.configService.get('GMAIL_REFRESH_TOKEN')
            }
          });
          console.log("tetetete", data);
          config.sendMail(data);
        // this.mailerService.addTransporter('gmail', config);
      }
}

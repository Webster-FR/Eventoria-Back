import {Injectable} from "@nestjs/common";
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class EmailService{
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ){}

    async sendEmail(to: string, subject: string, body: string){
        await this.mailerService.sendMail({
            from: this.configService.get("EMAIL_USER"),
            to,
            subject,
            text: body,
        });
    }
}

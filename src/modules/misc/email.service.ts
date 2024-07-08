import {Injectable} from "@nestjs/common";
import {MailerService} from "@nestjs-modules/mailer";

@Injectable()
export class EmailService{
    constructor(
        private readonly mailerService: MailerService,
    ){}

    async sendEmail(to: string, subject: string, body: string){
        await this.mailerService.sendMail({
            from: "Eventoria",
            to,
            subject,
            html: body,
        });
    }
}

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    async sendPasswordResetCode(to: string, code: string): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject: 'Your SynapseSAT password reset code',
            text: `Your password reset code is ${code}. It expires in 15 minutes.`,
            html: `<p>Your password reset code is <strong>${code}</strong>. It expires in 15 minutes.</p>`,
        });
    }
}
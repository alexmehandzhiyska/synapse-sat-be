import * as nodemailer from 'nodemailer';

import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
    const originalEnv = process.env;
    let sendMail: jest.Mock;

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: '587',
            SMTP_USER: 'smtp-user',
            SMTP_PASSWORD: 'smtp-password',
            SMTP_FROM: 'no-reply@synapsesat.com',
        };

        sendMail = jest.fn().mockResolvedValue(undefined);
        (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe('transport', () => {
        it('is configured from the SMTP environment variables', () => {
            new MailService();

            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                host: 'smtp.test.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'smtp-user',
                    pass: 'smtp-password',
                },
            });
        });

        it('uses a secure connection on port 465', () => {
            process.env.SMTP_PORT = '465';

            new MailService();

            expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }));
        });

        it('defaults to port 587 when no port is set', () => {
            delete process.env.SMTP_PORT;

            new MailService();

            expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 587, secure: false }));
        });
    });

    describe('sendPasswordResetCode', () => {
        it('sends the reset code to the given address', async () => {
            const service = new MailService();

            await service.sendPasswordResetCode('pencho@test.com', '123456');

            expect(sendMail).toHaveBeenCalledWith({
                from: 'no-reply@synapsesat.com',
                to: 'pencho@test.com',
                subject: 'Your SynapseSAT password reset code',
                text: 'Your password reset code is 123456. It expires in 15 minutes.',
                html: '<p>Your password reset code is <strong>123456</strong>. It expires in 15 minutes.</p>',
            });
        });

        it('throws when sending fails', async () => {
            sendMail.mockRejectedValue(new Error('SMTP down'));
            const service = new MailService();

            await expect(service.sendPasswordResetCode('pencho@test.com', '123456')).rejects.toThrow('SMTP down');
        });
    });
});
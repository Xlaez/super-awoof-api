import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import { resolve } from "path";
import mjml2html from "mjml";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as nodemailer from "nodemailer";
import { IMailOptions } from "./interface";
import envConfigs from "../configs/env.configs";
import { isProdEnv } from "../helpers/environment.helper";

export class EmailService extends DolphServiceHandler<Dolph> {
  constructor() {
    super("emailservice");
  }

  private async send(options: IMailOptions) {
    const transportOptions: SMTPTransport.Options = {
      port: 587,
      auth: {
        user: envConfigs.smtp.user,
        pass: envConfigs.smtp.pass,
      },
    };

    if (isProdEnv()) {
      transportOptions.host = envConfigs.smtp.service;
    } else {
      transportOptions.service = envConfigs.smtp.service;
      transportOptions.auth.type = "Login";
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const mailOptions = {
      from: "info@superawoof.ng",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    return transporter.sendMail(mailOptions);
  }

  private convertFromMjmlToHtml(path: string) {
    const pathToMail = readFileSync(resolve(__dirname, path)).toString();
    return compile(mjml2html(pathToMail).html);
  }

  public async sendAccountVerificationMail(
    to: string,
    otp: string,
    name: string
  ) {
    return this.send({
      to,
      subject: "Verify Email",
      html: this.convertFromMjmlToHtml("../../templates/verify_email.mjml")({
        otp,
        name,
      }),
    });
  }

  public async sendEmailToIllumi8Mail(
    from: string,
    title: string,
    body: string,
    descr?: string
  ) {
    return this.send({
      to: envConfigs.app.email,
      subject: title,
      html: `<html>
  <body>
    <h2> New message from ${from}:</h2>
    <br/>
    <strong>Description: ${descr}</strong>
    <p>Body: ${body}</p>
  </body>
</html>
`,
    });
  }

  public async sendPasswordResetMail(to: string, otp: string) {
    return this.send({
      to,
      subject: "Reset Password",
      html: this.convertFromMjmlToHtml(
        "../../templates/password_reset_email.mjml"
      )({
        otp,
      }),
    });
  }
}

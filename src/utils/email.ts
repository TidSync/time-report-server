import { ErrorMessage } from 'constants/api-messages';
import { ErrorCode, StatusCode } from 'constants/api-rest-codes';
import { HttpException } from 'exceptions/http-exception';
import nodemailer from 'nodemailer';
import { EMAIL, EMAIL_PASSWORD } from 'secrets';

const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    //asign createTransport method in nodemailer to a variable
    //service: to determine which email platform to use
    //auth contains the senders email and password which are all saved in the .env
    const Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });

    //return the Transporter variable which has the sendMail method to send the mail
    //which is within the mailOptions
    return await Transporter.sendMail({
      from: EMAIL,
      to,
      subject,
      text,
    });
  } catch (error) {
    throw new HttpException(
      ErrorMessage.EMAIL_NOT_SENT,
      ErrorCode.EMAIL_NOT_SENT,
      StatusCode.BAD_GATEWAY,
      error,
    );
  }
};

export const sendResetPasswordEmail = async (
  userEmail: string,
  userName: string,
  token: string,
  hostUrl: string,
) => {
  const to = userEmail;
  const subject = 'Reset password Link';
  const text = `Hello, ${userName} Please reset your password by
                      clicking this link:
                      ${hostUrl}/api/auth/reset-password/${token} `;

  await sendEmail(to, subject, text);
};

export const sendVerificationEmail = async (
  userEmail: string,
  userName: string,
  token: string,
  hostUrl: string,
) => {
  const to = userEmail;
  const subject = 'Account Verification Link';
  const text = `Hello, ${userName} Please verify your email by
                      clicking this link:
                      ${hostUrl}/api/auth/verify-user/${token} `;

  await sendEmail(to, subject, text);
};

export const sendOrganisationInvitation = async (
  userEmail: string,
  organisationName: string,
  organisationId: string,
  userId: string,
  hostUrl: string,
) => {
  const to = userEmail;
  const subject = 'Account Verification Link';
  const text = `Hello, please join the organisation ${organisationName} 
                      by clicking on this link:
                      ${hostUrl}/api/user/accept-organisation-invitation/${organisationId}/${userId}`;

  await sendEmail(to, subject, text);
};

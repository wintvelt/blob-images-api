const url = process.env.frontend || process.env.devFrontend || 'http://localhost:3000';

export const message = (name, email, code) => {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <title>Reset your Photo Duck password</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <table align="center" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                <tr>
                    <td>
                        <h2>Hi ${name},</h2>
                        <br/>
                        To reset your password, you will need the verification code below.<br/>
                        <br/>
                        <h3>Your verification code is <span style="font-weight: bold">${code}</span>.</h3>
                        You can enter this code directly on the password reset page, <br/>
                        <br/>
                        Or go to ${url}/confirmpsw?email=${email}&code=${code} <br/>
                        (where you need to enter your email address also).<br/>
                        <br/>
                        We look forward to seeing you back!
                    </td>
                </tr>
            </table>
        </html>
    `;
};
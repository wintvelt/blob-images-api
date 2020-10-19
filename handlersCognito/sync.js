import { message as verifySignupMessage } from './verifySignup';
import { message as forgotPasswordMessage } from './forgotPassword';

export const main = (event, context, callback) => {
    const name = event.request.userAttributes['custom:name'];
    const email = event.request.userAttributes.email;
    const code = event.request.codeParameter;
    if (event.triggerSource === "CustomMessage_SignUp" ||
        event.triggerSource === "CustomMessage_ResendCode") {
        event.response.emailSubject = "Bevestig je emailadres voor clubalmanac";
        event.response.emailMessage = verifySignupMessage(name, email, code);
    } else if (event.triggerSource === "CustomMessage_ForgotPassword") {
        event.response.emailSubject = "Stel je wachtwoord voor clubalmanac opnieuw in";
        event.response.emailMessage = forgotPasswordMessage(name, email, code);
    }

    callback(null, event);
};
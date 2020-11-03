import { message as verifySignupMessage } from './verifySignup';
import { message as forgotPasswordMessage } from './forgotPassword';
import { message as tempPasswordMessage } from './tempPassword';
import { adminCreateDbUser } from './adminCreateDbUser';

export const main = (event, context, callback) => {
    const name = event.request.userAttributes['custom:name'];
    const email = event.request.userAttributes.email;
    const code = event.request.codeParameter;
    const username = event.request.usernameParameter;
    console.log(event.request);
    if (event.triggerSource === "CustomMessage_SignUp" ||
        event.triggerSource === "CustomMessage_ResendCode") {
        event.response.emailSubject = "Bevestig je emailadres voor clubalmanac";
        event.response.emailMessage = verifySignupMessage(name, email, code);
    } else if (event.triggerSource === "CustomMessage_ForgotPassword") {
        event.response.emailSubject = "Stel je wachtwoord voor clubalmanac opnieuw in";
        event.response.emailMessage = forgotPasswordMessage(name, email, code);
    } else if (event.triggerSource === "CustomMessage_AdminCreateUser") {
        console.log('triggered by manual creation of user');
        console.log(event.request);
        adminCreateDbUser(event.request);
        event.response.emailSubject = "Je bent lid gemaakt van clubalmanac";
        const message = tempPasswordMessage(username, code);
        console.log(message);
        event.response.emailMessage = message;
    }

    callback(null, event);
};
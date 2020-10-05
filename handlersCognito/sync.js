import { message as verifySignupMessage } from './verifySignup';
import { message as forgotPasswordMessage } from './forgotPassword';

export const main = (event, context, callback) => {
    const name = event.request.userAttributes['custom:name'];
    const email = event.request.userAttributes.email;
    const code = event.request.codeParameter;
    if (event.triggerSource === "CustomMessage_SignUp" ||
        event.triggerSource === "CustomMessage_ResendCode") {
        event.response.emailSubject = "Confirm your email address for Photo Duck";
        event.response.emailMessage = verifySignupMessage(name, email, code);
    } else if (event.triggerSource === "CustomMessage_ForgotPassword") {
        event.response.emailSubject = "Reset your password on Photo Duck";
        event.response.emailMessage = forgotPasswordMessage(name, email, code);
    }

    callback(null, event);
};
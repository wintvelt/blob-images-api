const webmaster = process.env.webmaster || process.env.devWebmaster;
const allowSignup = (process.env.devAllowSignup && process.env.devAllowSignup === 'true');

export const main = (event, context, callback) => {
    const email = event.request.userAttributes.email;
    if (allowSignup || email === webmaster) {
        callback(null, event);
    } else {
        throw new Error('signup denied');
        // callback(null, {});
    }
};
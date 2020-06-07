export const invite = ({toName, toEmail, fromName, groupName, url, expirationDate, message}) => ({
    Destination: {
        ToAddresses: [
            toEmail,
        ]
    },
    Message: {
        Body: {
            Html: {
                Charset: "UTF-8",
                Data: `<table align="center" cellpadding="8" cellspacing="0 " width="600" style="border-collapse: collapse;">
                        <tr>
                            <td>
                                <h2>Hi ${toName},</h2>
                                <br/>
                                ${fromName} has invited you to join "${groupName}" 
                                on Photo duck<br/>
                                You can view your invite <a href=${url}>here</a><br/>
                                <br/>
                                This invite is valid until ${expirationDate}<br/>
                                <br/>
                                ${message}
                                <br/>
                            </td>
                        </tr>
                        <tr><td>All the best from the team at <a href="https://photo-duck.com">Photo duck</a>.</td></tr>
                    </table>
            `
            },
            Text: {
                Charset: "UTF-8",
                Data: `Hi ${toName},
                    ${fromName} has invited you to join "${groupName}" on Photo duck.
                    Visit ${url} to join!
                    This invite is valid until ${expirationDate}.
                    `
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: `${fromName} has invited you to join "${groupName}" on Photo duck.`
        }
    },
    ReplyToAddresses: [
        "wintvelt@xs4all.nl",
    ],
    Source: "wintvelt@xs4all.nl",
});
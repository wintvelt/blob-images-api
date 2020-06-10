export const acceptedInvite = ({toName, toEmail, fromName, groupName, url}) => ({
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
                                Yohoo! ${fromName} has accepted your invite to join "${groupName}" 
                                on Photo duck<br/>
                                Visit <a href=${url}>the ${groupName} page</a> to find out if there's anything new<br/>
                                <br/>
                                Hope to see you again soon!
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
                    ${fromName} has accepted your invite you to join "${groupName}".
                    Visit ${url} to see the latest!
                    `
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: `${fromName} has accepted your invite to join "${groupName}" on Photo duck.`
        }
    },
    ReplyToAddresses: [
        "wintvelt@xs4all.nl",
    ],
    Source: "wintvelt@xs4all.nl",
});
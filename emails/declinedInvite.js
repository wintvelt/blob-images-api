export const declinedInvite = ({toName, toEmail, fromName, groupName, url}) => ({
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
                                Helaas! ${fromName} heeft je uitnodiging om lid te worden van "${groupName}" 
                                op clubalmanac helaas afgeslagen.<br/>
                                Je kun de <a href=${url}>${groupName} pagina</a> bekijken of er verder nog nieuws is.<br/>
                                <br/>
                                Tot binnenkort!
                                <br/>
                            </td>
                        </tr>
                        <tr><td>Weledele groet van Vaatje namens <a href="https://clubalmanac.com">clubalmanac</a>.</td></tr>
                    </table>
            `
            },
            Text: {
                Charset: "UTF-8",
                Data: `Hi ${toName},
                    ${fromName} heeft je uitnodiging om lid te worden van "${groupName}" helaas afgeslagen.
                    Bezoek de groepspagina op ${url} voor mogelijk ander nieuws.
                    `
            }
        },
        Subject: {
            Charset: "UTF-8",
            Data: `${fromName} heeft je uitnodiging om lid te worden van "${groupName}" op clubalmanac geweigered.`
        }
    },
    ReplyToAddresses: [
        "wintvelt@xs4all.nl",
    ],
    Source: "wintvelt@xs4all.nl",
});
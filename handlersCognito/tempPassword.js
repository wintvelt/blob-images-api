import {
    // dividerCell,
    emailBody, row, textCell,
    footerRow, greeting, headerRow, paragraph, makeEmailSrc,
    codeCell,
    signatureCell,
    // buttonCell,
    // buttonEscape
} from 'blob-common/core/email';

const baseUrl = process.env.frontend || process.env.devFrontend || 'http://localhost:3000';
// const dividerSrc = makeEmailSrc('public/img/invite_divider.png');

export const message = (email, code) => {
    const url = `${baseUrl}/completepsw?email=${email}`;
    const textBody = `Er is een account voor je gemaakt op clubalmanac<br/>
Je gebruikersnaam is ${email}<br/>
</br>
Je tijdelijkse wachtwoord is`;
    const textBody2 = `Via onderstaande link kun je een nieuw wachtwoord instellen<br/>
<a href="${url}">${url}</a>`;

    return emailBody([
        headerRow(makeEmailSrc('public/img/logo_email_1.png')),
        row([
            textCell(greeting(`Hi`)),
            textCell(paragraph(textBody)),
            codeCell(code),
            textCell(paragraph(textBody2)),
            // buttonCell('Stel nieuw wachtwoord', url),
            // textCell(buttonEscape(url)),
            // dividerCell(dividerSrc),
        ]),
        row([
            textCell(paragraph('Met hoogachtende groet')),
            signatureCell(makeEmailSrc('public/img/signature_wouter.png'))
        ]),
        footerRow
    ]);
};
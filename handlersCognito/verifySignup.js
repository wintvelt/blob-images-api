import {
    dividerCell, emailBody, row, textCell,
    footerRow, greeting, headerRow, paragraph, signatureCell, makeEmailSrc, codeCell
} from 'blob-common/core/email';

const baseUrl = process.env.frontend || process.env.devFrontend || 'http://localhost:3000';

export const message = (name, email, code) => {
    const url = `${url}/verifysignup?email=${email}&code=${code}`;
    const textBody = `Dankjewel voor je aanmelding als lid bij clubalmanac.
    Om je inschrijving af te ronden, willen graag nog wel je email adres bevestigen.
    Dit kun je doen met de code hieronder.`;
    const textBody2 = `Kopieer deze code rechtstreeks in de verificatiepagina,
    Of open <a href="${url}">${url}</a> in je browser.
    
    We zien je graag als lid bij clubalmanac terug!`;

    return emailBody([
        headerRow(makeEmailSrc('public/img/logo_email_1.png')),
        row([
            dividerCell(makeEmailSrc('public/img/verify.png')),
            textCell(greeting(`Hi ${name}`)),
            textCell(paragraph(textBody)),
            codeCell(code),
            textCell(paragraph(textBody2)),
            dividerCell(dividerSrc),
        ]),
        row([
            textCell(paragraph('Met hoogachtende groet')),
            signatureCell(makeEmailSrc('public/img/signature_wouter.png'))
        ]),
        footerRow
    ]);
};
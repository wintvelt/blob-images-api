import { ses } from 'blob-common/core/ses';
import {
    dividerCell, emailBody, row, textCell,
    footerRow, greeting, headerRow, paragraph, photoRow, signatureCell, makeEmailSrc, buttonCell, buttonEscape
} from 'blob-common/core/email';

const dividerSrc = makeEmailSrc('public/img/invite_divider.png');
const frontEndUrl = process.env.frontend || process.env.devFrontend || 'http://localhost:3000';

export const memberMailBody = ({ fromName, groupName, photoUrl, createdAt }) => {
    const url = `${frontEndUrl}/personal/photos`;
    const text = `Een triest moment uiteraard. De groep bestond al sinds ${createdAt}<br/>
    De groep en alle albums zijn van clubalmanac verwijderd en niet meer toegankelijk<br/>
    Foto\'s van andere leden van "${groupName}" kun je niet meer bij<br/>
    Je eigen foto\'s zijn nog wel voor jou beschikbaar, op je eigen fotopagina`;

    return emailBody([
        headerRow(makeEmailSrc('public/img/logo_email_1.png'), frontEndUrl),
        (photoUrl) ? photoRow(makeEmailSrc(photoUrl, 640, 200), url) : '',
        row([
            textCell(greeting(`Geachte leden van "${groupName}",`)),
            textCell(paragraph(`${fromName} heeft de groep <strong><span style="font-size: 16px;">${groupName}</span></strong> opgeheven`)),
            textCell(paragraph(text)),
            buttonCell('Bekijk mijn foto\'s', url),
            textCell(buttonEscape(url)),
            dividerCell(dividerSrc),
        ]),
        row([
            textCell(paragraph('We zien je graag terug bij andere groepen op clubalmanac')),
            signatureCell(makeEmailSrc('public/img/signature_wouter.png'))
        ]),
        footerRow
    ]);
};

export const memberMailText = ({ fromName, groupName }) => {
    const url = `${frontEndUrl}/personal/photos`;
    return `Beste leden van ${groupName}, ${fromName} heeft de groep helaas opgeheven. 
    Je eigen foto's in de groep zijn nog steeds terug te vinden op ${url}.`;
};

export const memberMailSubject = ({ fromName, groupName }) => {
    return `"${groupName}" op clubalmanac is door ${fromName} opgeheven`;
};

export const mailToMembers = (members) => {
    // return empty promise list if no members
    if (!members || members.length === 0) return undefined;

    // find founder - only founder can delete a group
    const foundingMem = members.find(member => member.isFounder);
    const founder = foundingMem?.user;
    const group = foundingMem?.group;

    const mailParams = {
        fromName: founder?.name || 'De onbekende oprichter',
        toEmail: members.map(mem => mem.user.email),
        groupName: group?.name || 'Een groep waar je lid van was',
        photoUrl: group?.photo?.url,
        createdAt: group?.createdAt || 'best lang'
    };
    console.log({ mailParams });
    const niceBody = memberMailBody(mailParams);
    const textBody = memberMailText(mailParams);
    const subject = memberMailSubject(mailParams);

    const mailPromise = ses.sendEmail({
        toEmail: mailParams.toEmail,
        fromEmail: 'clubalmanac <wouter@clubalmanac.com>',
        subject,
        data: niceBody,
        textData: textBody
    });

    return mailPromise;
};
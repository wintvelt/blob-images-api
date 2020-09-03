import sanitizeHtml from 'sanitize-html';

// text sanitizer for HTML (included in emails)
export const sanitize = (dirty) => sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {}
});
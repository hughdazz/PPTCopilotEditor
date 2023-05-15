import { voidTags } from './tags';
export const formatAttributes = (attributes) => {
    return attributes.reduce((attrs, attribute) => {
        const { key, value } = attribute;
        if (value === null)
            return `${attrs} ${key}`;
        if (key === 'style' && !value)
            return '';
        const quoteEscape = value.indexOf('\'') !== -1;
        const quote = quoteEscape ? '"' : '\'';
        return `${attrs} ${key}=${quote}${value}${quote}`;
    }, '');
};
export const toHTML = (tree) => {
    const htmlStrings = tree.map(node => {
        if (node.type === 'text')
            return node.content;
        if (node.type === 'comment')
            return `<!--${node.content}-->`;
        const { tagName, attributes, children } = node;
        const isSelfClosing = voidTags.includes(tagName.toLowerCase());
        if (isSelfClosing)
            return `<${tagName}${formatAttributes(attributes)}>`;
        return `<${tagName}${formatAttributes(attributes)}>${toHTML(children)}</${tagName}>`;
    });
    return htmlStrings.join('');
};
//# sourceMappingURL=stringify.js.map
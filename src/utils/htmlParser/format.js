export const splitHead = (str, sep) => {
    const idx = str.indexOf(sep);
    if (idx === -1)
        return [str];
    return [str.slice(0, idx), str.slice(idx + sep.length)];
};
const unquote = (str) => {
    const car = str.charAt(0);
    const end = str.length - 1;
    const isQuoteStart = car === '"' || car === "'";
    if (isQuoteStart && car === str.charAt(end)) {
        return str.slice(1, end);
    }
    return str;
};
const formatAttributes = (attributes) => {
    return attributes.map(attribute => {
        const parts = splitHead(attribute.trim(), '=');
        const key = parts[0];
        const value = typeof parts[1] === 'string' ? unquote(parts[1]) : null;
        return { key, value };
    });
};
export const format = (nodes) => {
    return nodes.map(node => {
        if (node.type === 'element') {
            const children = format(node.children);
            const item = {
                type: 'element',
                tagName: node.tagName.toLowerCase(),
                attributes: formatAttributes(node.attributes),
                children,
            };
            return item;
        }
        const item = {
            type: node.type,
            content: node.content,
        };
        return item;
    });
};
//# sourceMappingURL=format.js.map
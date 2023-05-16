import { nodes } from 'prosemirror-schema-basic';
import { listItem as _listItem } from 'prosemirror-schema-list';
const orderedList = {
    attrs: {
        order: {
            default: 1,
        },
        listStyleType: {
            default: '',
        },
    },
    content: 'list_item+',
    group: 'block',
    parseDOM: [
        {
            tag: 'ol',
            getAttrs: dom => {
                const order = (dom.hasAttribute('start') ? dom.getAttribute('start') : 1) || 1;
                const attr = { order: +order };
                const { listStyleType } = dom.style;
                if (listStyleType)
                    attr['listStyleType'] = listStyleType;
                return attr;
            }
        }
    ],
    toDOM: (node) => {
        const { order, listStyleType } = node.attrs;
        let style = '';
        if (listStyleType)
            style += `list-style-type: ${listStyleType};`;
        const attr = { style };
        if (order !== 1)
            attr['start'] = order;
        return ['ol', attr, 0];
    },
};
const bulletList = {
    attrs: {
        listStyleType: {
            default: '',
        },
    },
    content: 'list_item+',
    group: 'block',
    parseDOM: [
        {
            tag: 'ul',
            getAttrs: dom => {
                const { listStyleType } = dom.style;
                return listStyleType ? { listStyleType } : {};
            }
        }
    ],
    toDOM: (node) => {
        const { listStyleType } = node.attrs;
        let style = '';
        if (listStyleType)
            style += `list-style-type: ${listStyleType};`;
        return ['ul', { style }, 0];
    },
};
const listItem = {
    ..._listItem,
    content: 'paragraph block*',
    group: 'block',
};
const paragraph = {
    attrs: {
        align: {
            default: '',
        },
        indent: {
            default: 0,
        },
    },
    content: 'inline*',
    group: 'block',
    parseDOM: [
        {
            tag: 'p',
            getAttrs: dom => {
                const { textAlign } = dom.style;
                let align = dom.getAttribute('align') || textAlign || '';
                align = /(left|right|center|justify)/.test(align) ? align : '';
                const indent = +(dom.getAttribute('data-indent') || 0);
                return { align, indent };
            }
        },
        {
            tag: 'img',
            ignore: true,
        },
        {
            tag: 'pre',
            skip: true,
        },
    ],
    toDOM: (node) => {
        const { align, indent } = node.attrs;
        let style = '';
        if (align && align !== 'left')
            style += `text-align: ${align};`;
        const attr = { style };
        if (indent)
            attr['data-indent'] = indent;
        return ['p', attr, 0];
    },
};
// https://github.com/pipipi-pikachu/PPTist/issues/134
const { hard_break, ...otherNodes } = nodes;
export default {
    ...otherNodes,
    'ordered_list': orderedList,
    'bullet_list': bulletList,
    'list_item': listItem,
    paragraph,
};
//# sourceMappingURL=nodes.js.map
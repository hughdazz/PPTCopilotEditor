import { inputRules, wrappingInputRule, textblockTypeInputRule, smartQuotes, emDash, ellipsis, } from 'prosemirror-inputrules';
const blockQuoteRule = (nodeType) => wrappingInputRule(/^\s*>\s$/, nodeType);
const orderedListRule = (nodeType) => (wrappingInputRule(/^(\d+)\.\s$/, nodeType, match => ({ order: +match[1] }), (match, node) => node.childCount + node.attrs.order === +match[1]));
const bulletListRule = (nodeType) => wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
const codeBlockRule = (nodeType) => textblockTypeInputRule(/^```$/, nodeType);
export const buildInputRules = (schema) => {
    const rules = [
        ...smartQuotes,
        ellipsis,
        emDash,
    ];
    rules.push(blockQuoteRule(schema.nodes.blockquote));
    rules.push(orderedListRule(schema.nodes.ordered_list));
    rules.push(bulletListRule(schema.nodes.bullet_list));
    rules.push(codeBlockRule(schema.nodes.code_block));
    return inputRules({ rules });
};
//# sourceMappingURL=inputrules.js.map
import { TextSelection, AllSelection } from 'prosemirror-state';
import { isList } from './toggleList';
function setNodeIndentMarkup(tr, pos, delta) {
    if (!tr.doc)
        return tr;
    const node = tr.doc.nodeAt(pos);
    if (!node)
        return tr;
    const minIndent = 0;
    const maxIndent = 7;
    let indent = (node.attrs.indent || 0) + delta;
    if (indent < minIndent)
        indent = minIndent;
    if (indent > maxIndent)
        indent = maxIndent;
    if (indent === node.attrs.indent)
        return tr;
    const nodeAttrs = {
        ...node.attrs,
        indent,
    };
    return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}
const setTextIndent = (tr, schema, delta) => {
    const { selection, doc } = tr;
    if (!selection || !doc)
        return tr;
    if (!(selection instanceof TextSelection || selection instanceof AllSelection))
        return tr;
    const { from, to } = selection;
    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type;
        if (nodeType.name === 'paragraph' || nodeType.name === 'blockquote') {
            tr = setNodeIndentMarkup(tr, pos, delta);
            return false;
        }
        else if (isList(node, schema))
            return false;
        return true;
    });
    return tr;
};
export const indentCommand = (view, delta) => {
    const { state } = view;
    const { schema, selection } = state;
    const tr = setTextIndent(state.tr.setSelection(selection), schema, delta);
    if (tr.docChanged) {
        view.dispatch(tr);
        return true;
    }
    return false;
};
//# sourceMappingURL=setTextIndent.js.map
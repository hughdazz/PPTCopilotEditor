import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { buildPlugins } from './plugins/index';
import { schemaNodes, schemaMarks } from './schema/index';
const schema = new Schema({
    nodes: schemaNodes,
    marks: schemaMarks,
});
export const createDocument = (content) => {
    const htmlString = `<div>${content}</div>`;
    const parser = new window.DOMParser();
    const element = parser.parseFromString(htmlString, 'text/html').body.firstElementChild;
    return DOMParser.fromSchema(schema).parse(element);
};
export const initProsemirrorEditor = (dom, content, props = {}) => {
    return new EditorView(dom, {
        state: EditorState.create({
            doc: createDocument(content),
            plugins: buildPlugins(schema),
        }),
        ...props,
    });
};
//# sourceMappingURL=index.js.map
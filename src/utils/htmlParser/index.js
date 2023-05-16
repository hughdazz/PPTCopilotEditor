// 参考：https://github.com/andrejewski/himalaya 用TypeScript重写并简化部分功能
import { lexer } from './lexer';
import { parser } from './parser';
import { format } from './format';
import { toHTML } from './stringify';
export const toAST = (str) => {
    const tokens = lexer(str);
    const nodes = parser(tokens);
    return format(nodes);
};
export { toHTML };
//# sourceMappingURL=index.js.map
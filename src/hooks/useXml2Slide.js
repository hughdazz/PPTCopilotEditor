import { cloneDeep } from 'lodash';
export default () => {
    const changeText = (element, text) => {
        // 功能：替换一个元素中的文本
        // 前提：保证一个元素中只有一个文本
        // 实现：dfs遍历
        // 遍历所有子节点
        for (let i = 0; i < element.childNodes.length; i++) {
            const childNode = element.childNodes[i];
            // 如果是文本节点（nodeType为3）
            if (childNode.nodeType === 3) {
                // 使用回调函数处理文本内容
                console.log('before', childNode.nodeValue);
                childNode.nodeValue = text;
                console.log('after', childNode.nodeValue);
            }
            else {
                // 如果是元素节点，递归处理子节点
                changeText(childNode, text);
            }
        }
    };
    const update_xml_to_dom_to_slide = (xml, slides) => {
        // 功能：将xml转换为dom，再更新到id对应的slide中
        // 参数：gpt返回的xml；xml对应的slide数组
        // 说明：根据xml中的slide_id去找到要更新的slide(因此传入所有幻灯片指针)，根据xml中的element_id去找到要更新的element
        // 返回值：更新后的slides
        const parser = new DOMParser();
        const top_dom = parser.parseFromString(xml, 'application/xml');
        const slides_all = cloneDeep(slides); // 深拷贝
        if (top_dom.documentElement.nodeName === 'parsererror') {
            // console.error('XML 解析失败 when update_xml_to_dom_to_slide')
        }
        else {
            // console.log('XML 解析成功\n', xml)
            top_dom.querySelectorAll('slide').forEach((slide) => {
                // console.log(slide)
                const slide_id = slide.getAttribute('id');
                // 找到内存中对应id的幻灯片
                const slide_index = slides_all.findIndex((slide) => slide.id === slide_id);
                if (slide_index === -1) {
                    // console.error('未找到slide_id对应的slide')
                }
                else {
                    const inner_slide = slides_all[slide_index];
                    // 注意：这是遍历直接子级元素
                    let child = slide.firstChild;
                    while (child) {
                        if (child.nodeType === Node.ELEMENT_NODE) {
                            // console.log(child.nodeType, child.textContent, child instanceof Element)
                            const p = child;
                            const element_id = p.getAttribute('id');
                            // 找到内存中的幻灯片中的对应id的元素
                            const element_index = inner_slide.elements.findIndex((element) => element.id === element_id);
                            if (element_index === -1) {
                                // console.error(`未找到element_id${element_id}对应的element`)
                            }
                            else {
                                const inner_textElement = inner_slide.elements[element_index];
                                const inner_textElement_xml_dom = parser.parseFromString(inner_textElement.content, 'application/xml');
                                console.log('origin xml:', inner_textElement_xml_dom.documentElement.outerHTML);
                                console.log('target txt:', p.textContent);
                                changeText(inner_textElement_xml_dom.documentElement, p.textContent);
                                console.log('最终结果', inner_textElement_xml_dom.documentElement.outerHTML);
                                inner_textElement.content = inner_textElement_xml_dom.documentElement.outerHTML;
                            }
                        }
                        if (child?.nextSibling) {
                            child = child.nextSibling;
                        }
                        else {
                            break;
                        }
                    }
                }
            });
        }
        return slides_all;
    };
    return {
        update_xml_to_dom_to_slide
    };
};
//# sourceMappingURL=useXml2Slide.js.map
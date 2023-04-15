import { Slide, PPTTextElement} from '@/types/slides'
import { cloneDeep } from 'lodash'

export default () => {
  const update_xml_to_dom_to_slide = (xml: string, slides: Slide[]) => {
    // 功能：将xml转换为dom，再更新到id对应的slide中
    // 参数：gpt返回的xml；xml对应的slide数组
    // 说明：根据xml中的slide_id去找到要更新的slide(因此传入所有幻灯片指针)，根据xml中的element_id去找到要更新的element
    // 返回值：更新后的slides

    const parser = new DOMParser()
    const top_dom = parser.parseFromString(xml, 'application/xml')

    const slides_all = cloneDeep(slides) // 深拷贝

    if (top_dom.documentElement.nodeName === 'parsererror') {
      // console.error('XML 解析失败 when update_xml_to_dom_to_slide')
    }
    else {
      // console.log('XML 解析成功\n', xml)

      top_dom.querySelectorAll('slide').forEach((slide) => {
        // console.log(slide)
        const slide_id = slide.getAttribute('id')
        const slide_index = slides_all.findIndex((slide) => slide.id === slide_id)
        if (slide_index === -1) {
          // console.error('未找到slide_id对应的slide')
        }
        else {
          const inner_slide = slides_all[slide_index]
          // 注意：这是遍历直接子级元素
          let child: ChildNode | null = slide.firstChild
          while (child) {

            if (child.nodeType === Node.ELEMENT_NODE) {

              // console.log(child.nodeType, child.textContent, child instanceof Element)
              const p = child as Element
              const element_id = p.getAttribute('id')
              const element_index = inner_slide.elements.findIndex((element) => element.id === element_id)
              if (element_index === -1) {
                // console.error(`未找到element_id${element_id}对应的element`)
              }
              else {
                const inner_textElement = inner_slide.elements[element_index] as PPTTextElement
                const target_textContent = p.textContent as string

                // console.log('origin xml:', inner_textElement.content)
                // console.log('target xml:', p.outerHTML)
                // console.log('target txt:', target_textContent)

                p.removeAttribute('id')
                // console.log('最终结果', p.outerHTML)
                inner_textElement.content = p.outerHTML
              }
            }

            if (child?.nextSibling) {
              child = child.nextSibling
            }
            else {
              break
            }
          }
        }

      })
    }
    return slides_all
  }

  return {
    update_xml_to_dom_to_slide
  }
}
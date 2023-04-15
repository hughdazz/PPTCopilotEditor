import { Slide, PPTTextElement} from '@/types/slides'

export default () => {
  const convert_slide_to_dom = (slide: Slide, root_name = 'slide') => {
    // 功能：输入一页slide，提取有效信息为dom结构并返回
    // 说明：现只支持对text的提取。暂未保证顺序从上到下、从左到右 TODO
    // 返回值：dom结构，在顶层进行解析

    // const parser = new DOMParser()

    const page = document.createElement(root_name)
    page.setAttribute('id', slide.id)

    const elements = slide.elements // 引用传值

    const parser = new DOMParser()

    for (let j = 0; j < elements.length; j++) {
      if (elements[j].type === 'text') {
        // 使用DOM 获取 XML 文档
        const textElement = elements[j] as PPTTextElement

        const top_Element_dom = parser.parseFromString(textElement.content, 'application/xml')
        top_Element_dom.documentElement.setAttribute('id', textElement.id)
        // top_Element_dom.documentElement.setAttribute('left', textElement.left.toString())
        // top_Element_dom.documentElement.setAttribute('top', textElement.top.toString())
        // top_Element_dom.documentElement.setAttribute('width', textElement.width.toString())
        // top_Element_dom.documentElement.setAttribute('height', textElement.height.toString())
        // top_Element_dom.documentElement.setAttribute('rotate', textElement.rotate.toString())

        const text = top_Element_dom.documentElement.outerHTML

        page.appendChild(top_Element_dom.documentElement)
      }
    }
    // 将xml转换为字符串
    // console.log(page.outerHTML)

    return page
  }

  const convert_slides_to_dom = (slides: Slide[], root_name = 'slides') => {
    // 功能：将选中张幻灯片转换为dom
    // 说明：调用convert_slide_to_dom。目前，外部只调用convert_slides_to_dom
    // 返回值：dom结构，在顶层进行解析
    
    const top_dom = document.createElement(root_name)
    for (let i = 0; i < slides.length; i++) {
      const page = convert_slide_to_dom(slides[i])
      top_dom.appendChild(page)
    }
    return top_dom
  }

  return {
    convert_slides_to_dom
  }

}
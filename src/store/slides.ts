import { defineStore } from 'pinia'
import tinycolor from 'tinycolor2'
import { omit } from 'lodash'
import { Slide, SlideTheme, PPTElement, PPTAnimation, PPTTextElement } from '@/types/slides'
import { slides } from '@/mocks/slides'
import { theme } from '@/mocks/theme'
import { layouts } from '@/mocks/layout'
import { get_catalog, update_slides} from '@/api/ppt_Request_gpt'
import { SetRequired } from 'type-fest'
import { Chili } from '@icon-park/vue-next'

interface RemoveElementPropData {
  id: string
  propName: string | string[]
}

interface UpdateElementData {
  id: string | string[]
  props: Partial<PPTElement>
}

interface FormatedAnimation {
  animations: PPTAnimation[]
  autoNext: boolean
}

export interface SlidesState {
  theme: SlideTheme
  slides: Slide[]
  slideIndex: number
  viewportRatio: number
}

export const useSlidesStore = defineStore('slides', {
  state: (): SlidesState => ({
    theme: theme, // 主题样式
    slides: slides, // 幻灯片页面数据
    slideIndex: 0, // 当前页面索引
    viewportRatio: 0.5625, // 可视区域比例，默认16:9
  }),

  getters: {
    currentSlide(state) {
      return state.slides[state.slideIndex]
    },
  
    currentSlideAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      return currentSlide.animations.filter(animation => elIds.includes(animation.elId))
    },

    // 格式化的当前页动画
    // 将触发条件为“与上一动画同时”的项目向上合并到序列中的同一位置
    // 为触发条件为“上一动画之后”项目的上一项添加自动向下执行标记
    formatedAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      const animations = currentSlide.animations.filter(animation => elIds.includes(animation.elId))

      const formatedAnimations: FormatedAnimation[] = []
      for (const animation of animations) {
        if (animation.trigger === 'click' || !formatedAnimations.length) {
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
        else if (animation.trigger === 'meantime') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.animations = last.animations.filter(item => item.elId !== animation.elId)
          last.animations.push(animation)
          formatedAnimations[formatedAnimations.length - 1] = last
        }
        else if (animation.trigger === 'auto') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.autoNext = true
          formatedAnimations[formatedAnimations.length - 1] = last
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
      }
      return formatedAnimations
    },
  
    layouts(state) {
      const {
        themeColor,
        fontColor,
        fontName,
        backgroundColor,
      } = state.theme
  
      const subColor = tinycolor(fontColor).isDark() ? 'rgba(230, 230, 230, 0.5)' : 'rgba(180, 180, 180, 0.5)'
  
      const layoutsString = JSON.stringify(layouts)
        .replaceAll('{{themeColor}}', themeColor)
        .replaceAll('{{fontColor}}', fontColor)
        .replaceAll('{{fontName}}', fontName)
        .replaceAll('{{backgroundColor}}', backgroundColor)
        .replaceAll('{{subColor}}', subColor)
      
      return JSON.parse(layoutsString)
    },
  },

  actions: {
    setTheme(themeProps: Partial<SlideTheme>) {
      this.theme = { ...this.theme, ...themeProps }
    },
  
    setViewportRatio(viewportRatio: number) {
      this.viewportRatio = viewportRatio
    },
  
    setSlides(slides: Slide[]) {
      this.slides = slides
    },
  
    addSlide(slide: Slide | Slide[]) {
      const slides = Array.isArray(slide) ? slide : [slide]
      const addIndex = this.slideIndex + 1
      this.slides.splice(addIndex, 0, ...slides)
      this.slideIndex = addIndex
    },
  
    updateSlide(props: Partial<Slide>) {
      const slideIndex = this.slideIndex
      this.slides[slideIndex] = { ...this.slides[slideIndex], ...props }
    },
  
    deleteSlide(slideId: string | string[]) {
      const slidesId = Array.isArray(slideId) ? slideId : [slideId]
  
      const deleteSlidesIndex = []
      for (let i = 0; i < slidesId.length; i++) {
        const index = this.slides.findIndex(item => item.id === slidesId[i])
        deleteSlidesIndex.push(index)
      }
      let newIndex = Math.min(...deleteSlidesIndex)
  
      const maxIndex = this.slides.length - slidesId.length - 1
      if (newIndex > maxIndex) newIndex = maxIndex
  
      this.slideIndex = newIndex
      this.slides = this.slides.filter(item => !slidesId.includes(item.id))
    },
  
    updateSlideIndex(index: number) {
      this.slideIndex = index
    },
  
    addElement(element: PPTElement | PPTElement[]) {
      const elements = Array.isArray(element) ? element : [element]
      const currentSlideEls = this.slides[this.slideIndex].elements
      const newEls = [...currentSlideEls, ...elements]
      this.slides[this.slideIndex].elements = newEls
    },

    deleteElement(elementId: string | string[]) {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId]
      const currentSlideEls = this.slides[this.slideIndex].elements
      const newEls = currentSlideEls.filter(item => !elementIdList.includes(item.id))
      this.slides[this.slideIndex].elements = newEls
    },
  
    updateElement(data: UpdateElementData) {
      const { id, props } = data
      const elIdList = typeof id === 'string' ? [id] : id
  
      const slideIndex = this.slideIndex
      const slide = this.slides[slideIndex]
      const elements = slide.elements.map(el => {
        return elIdList.includes(el.id) ? { ...el, ...props } : el
      })
      this.slides[slideIndex].elements = (elements as PPTElement[])
    },
  
    removeElementProps(data: RemoveElementPropData) {
      const { id, propName } = data
      const propsNames = typeof propName === 'string' ? [propName] : propName
  
      const slideIndex = this.slideIndex
      const slide = this.slides[slideIndex]
      const elements = slide.elements.map(el => {
        return el.id === id ? omit(el, propsNames) : el
      })
      this.slides[slideIndex].elements = (elements as PPTElement[])
    },

    convert_slide_to_dom(slide: Slide, root_name = 'slide') {
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
    },

    convert_slides_to_dom(slides: Slide[], root_name = 'slides') {
      // 功能：将选中张幻灯片转换为dom
      // 说明：调用convert_slide_to_dom。目前，外部只调用convert_slides_to_dom
      // 返回值：dom结构，在顶层进行解析
      
      const top_dom = document.createElement(root_name)
      for (let i = 0; i < slides.length; i++) {
        const page = this.convert_slide_to_dom(slides[i])
        top_dom.appendChild(page)
      }
      return top_dom
    },

    update_xml_to_dom_to_slide(xml: string, slides_all = slides) {
      // 功能：将xml转换为dom，再更新到id对应的slide中
      // 说明：根据xml中的slide_id去找到要更新的slide(因此传入所有幻灯片指针)，根据xml中的element_id去找到要更新的element
      // 返回值：

      const parser = new DOMParser()
      const top_dom = parser.parseFromString(xml, 'application/xml')

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


    },

    request_update_slides(prompt: string): void {
      const formData = new FormData()
      formData.append('user_name', 'ljf')
      formData.append('prompt', prompt)

      const dom_top = this.convert_slides_to_dom(this.slides)
      formData.append('ppt_xml', dom_top.outerHTML)

      const receive_xml = `
<slides>
<slide id="test-slide-1">
    <p id="idn7Mx"><strong><span style="font-size:  112px">论语</span></strong></p>
    <p id="7stmVP"><span style="font-size:  24px">孔子的智慧与教导</span></p>
</slide>
<slide id="yH_-FXmhGU">
    <p style="text-align: center;" id="tEyqPBBaml"><strong><span style="font-size: 112px">论语导言</span></strong></p>
    <p style="" id="VCguVf4l1B"><span style="font-size: 24px">论语是儒家学派的经典文献，记录了孔子及其弟子的言行。</span></p>
</slide>
<slide id="Gh9ZjY8j3H">
    <p style="text-align: center;" id="sL7xvxns-u"><strong><span style="font-size: 48px">目录</span></strong></p>
    <ol style="list-style-type: lower-roman;" id="tS11ELDqgH">
        <li><p style="text-align: center;"><span style="font-size: 28px">论语简介</span></p></li>
        <li><p style="text-align: center;"><span style="font-size: 28px">孔子的思想</span></p></li>
        <li><p style="text-align: center;"><span style="font-size: 28px">论语的影响</span></p></li>
    </ol>
</slide>
<slide id="S_cO7EuNcV">
    <p style="text-align: center;" id="07pzVgNyIZ"><strong><span style="font-size: 48px">论语简介</span></strong></p>
    <ol style="list-style-type: lower-roman;" id="eIiAj3VJSZ">
        <li><p style="text-align: center;"><span style="font-size: 28px">成书时间</span></p></li>
        <li><p style="text-align: center;"><span style="font-size: 28px">作者及其弟子</span></p></li>
        <li><p style="text-align: center;"><span style="font-size: 28px">内容结构</span></p></li>
        <li><p style="text-align: center;"><span style="font-size: 28px">主要观点</span></p></li>
    </ol>
</slide>
</slides>
      `
      this.update_xml_to_dom_to_slide(receive_xml, this.slides)

      // update_slides(formData).then((response) => {
      //   console.log('response:', JSON.stringify(response, null, 2))
      //   const data = response.data 
      //   if (data) {
      //     receive_xml = data['xml_ppt']
      //     this.update_xml_to_dom_to_slide(receive_xml, this.slides)
      //   }
      // }).catch(error => {
      //   console.error('An error occurred:', error)
      // })
    },

  },
})
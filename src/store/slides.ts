import { defineStore } from 'pinia'
import tinycolor from 'tinycolor2'
import { omit } from 'lodash'
import { Slide, SlideTheme, PPTElement, PPTAnimation, PPTTextElement } from '@/types/slides'
import { slides } from '@/mocks/slides'
import { theme } from '@/mocks/theme'
import { layouts } from '@/mocks/layout'
import { update_slides, UpdateSlidesRequest } from '@/api/ppt_Request_gpt'
import useSlide2Dom from '@/hooks/useSlide2Dom'
import useXml2Slide from '@/hooks/useXml2Slide'

const { convert_slide_to_dom, convert_slides_to_dom } = useSlide2Dom()
const { update_xml_to_dom_to_slide } = useXml2Slide()

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


    request_update_slides(prompt: string): void {
      // console.log(1)

      const update_slides_requset: UpdateSlidesRequest = {
        'prompt': '',
        'slide': '',
      }
      update_slides_requset['prompt'] = prompt

      const target_slides = this.slides[this.slideIndex]

      const dom_top = convert_slide_to_dom(target_slides)
      update_slides_requset['slide'] = dom_top.outerHTML

      console.log(update_slides_requset['slide'])

      console.log('要修改的页面和命令：')
      console.log(JSON.stringify(update_slides_requset, null, 2))

      // const receive_xml = `<section id=\\"cover\\"><p id=\\"tEyqPBBaml\\">我为什么玩明日方舟11</p><p id=\\"VCguVf4l1B\\">汇报人：dhf11</p></section>`
      // const receive_xml = `<section id=\\"yH_-FXmhGU\\"><p id=\\"tEyqPBBaml\\">我为什么玩明日方舟11</p><p id=\\"VCguVf4l1B\\">汇报人：dhf11</p></section>`
      // const receive_xml = `<section id="yH_-FXmhGU"><p id="tEyqPBBaml">我为什么玩明日方舟11</p><p id="VCguVf4l1B">汇报人：dhf11</p></section>`

      let receive_xml = `<section id=\\"01JPyG4vNc\\"><p id=\\"a3DqEl_Pz8\\">有道是：知之者不如好之者，好之者不如乐之者。–孔子</p><p id=\\"Y8pCsHZiKJ\\">我希望未来成为一名成功的软件工程师，具有以下目标和计划:</p><p id=\\"UeffRV8G4Q\\">1.学习新的编程语言和技术，不断提高自己的技能水平</p><p id=\\"1K_Af9ASgy\\">2.参与开源项目或自己开发一些有用的工具，积累经验</p></section>`

      // 将 receive_xml 中的 \ 和 \\ 全部替换成空格
      // receive_xml = receive_xml.replace(/\\/g, '')

      const res_slides = update_xml_to_dom_to_slide(receive_xml, [target_slides])
      for (let i = 0; i < res_slides.length; i++) {
        target_slides[i] = res_slides[i]
      }
      // console.log('原来的的页面：\n', JSON.stringify(this.slides[this.slideIndex], null, 2))

      this.slides[this.slideIndex] = res_slides[0]

      console.log('res:\n', JSON.stringify(receive_xml, null, 2))

      // update_slides(update_slides_requset).then((response) => {
      //   console.log('response:', JSON.stringify(response, null, 2))
      //   const data = response.data
      //   if (data) {
      //     receive_xml = data
      //     const res_slides = update_xml_to_dom_to_slide(receive_xml, [target_slides])
      //     // for (let i = 0; i < res_slides.length; i++) {
      //     //   target_slides[i] = res_slides[i]
      //     // }
      //     this.slides[this.slideIndex] = res_slides[0]
      //   }
      // }).catch(error => {
      //   console.error('An error occurred:', error)
      // })

    },

  },
})

import { Slide, PPTElement} from '@/types/slides'
import useSlideHandler from '@/hooks/useSlideHandler'
import useReadFile from '@/hooks/useReadFile'
import {nanoid} from 'nanoid'

export default () => {
  const { readFile } = useReadFile()

  const template_json_path = './ppt_template/base_template.json'
  const template_slides: Slide[] = JSON.parse(readFile(template_json_path))

  const coverTemplate:Slide = template_slides[0]
  const catalogTemplate3 = template_slides[1]
  const catalogTemplate4 = template_slides[2]
  const catalogTemplate5 = template_slides[3]
  const contentTemplate2 = template_slides[4]
  const contentTemplate3 = template_slides[5]
  const contentTemplate4 = template_slides[6]

  const {
    copySlide,
    pasteSlide,
    createSlide,
    createSlideByTemplate,
    copyAndPasteSlide,
    deleteSlide,
    cutSlide,
    selectAllSlide,
    sortSlides,
  } = useSlideHandler()

  function coverReplace(cover: HTMLElement) {
    const title = cover.getElementsByTagName('p')[0].innerHTML
    const description = cover.getElementsByTagName('p')[1].innerHTML

    let ret = JSON.stringify(coverTemplate)
    // console.log(title, description, ret)
    ret = ret.replace('{{title}}', title)
    ret = ret.replace('{{description}}', description)

    return ret
  }
  function catalogReplace(catalog_dom: HTMLElement) {
    const p_num = catalog_dom.getElementsByTagName('p').length
    const p_list = catalog_dom.getElementsByTagName('p')

    const catalog = p_list[0].innerHTML
    let ret = ''
    if (p_num - 1 === 3) {
      ret = JSON.stringify(catalogTemplate3)
      ret = ret.replace('{{item1}}', p_list[1].innerHTML)
      ret = ret.replace('{{item2}}', p_list[2].innerHTML)
      ret = ret.replace('{{item3}}', p_list[3].innerHTML)
    }
    else if (p_num - 1 === 4) {
      ret = JSON.stringify(catalogTemplate4)
      ret = ret.replace('{{item1}}', p_list[1].innerHTML)
      ret = ret.replace('{{item2}}', p_list[2].innerHTML)
      ret = ret.replace('{{item3}}', p_list[3].innerHTML)
      ret = ret.replace('{{item4}}', p_list[4].innerHTML)
    }
    else if (p_num - 1 === 5) {
      ret = JSON.stringify(catalogTemplate5)
      ret = ret.replace('{{item1}}', p_list[1].innerHTML)
      ret = ret.replace('{{item2}}', p_list[2].innerHTML)
      ret = ret.replace('{{item3}}', p_list[3].innerHTML)
      ret = ret.replace('{{item4}}', p_list[4].innerHTML)
      ret = ret.replace('{{item5}}', p_list[5].innerHTML)
    }
    ret = ret.replace('{{catalog}}', catalog)
    return ret
  }
  function contentReplace(content: HTMLElement) {
    console.log('content:', JSON.stringify( content.outerHTML, null, 2))
    let p_num = content.getElementsByTagName('p').length
    const p_list = content.getElementsByTagName('p')
    const sub_title = p_list[0].innerHTML
    const retList: string[] = []
    // 如果p_num-1<=4，只用生成一个页面
    let index = 1
    while (p_num - 1 > 0) {
      if (p_num - 1 <= 4) {
        let ret = ''
        if (p_num - 1 === 2) {
          ret = JSON.stringify(contentTemplate2)
        }
        else if (p_num - 1 === 3) {
          ret = JSON.stringify(contentTemplate3)
        }
        else if (p_num - 1 === 4) {
          ret = JSON.stringify(contentTemplate4)
        }
        ret = ret.replace('{{sub_title}}', sub_title)
        for (let i = 1; i < p_num; i++) {
          ret = ret.replace('{{sub_title_content' + i + '}}', p_list[index++].innerHTML)
        }
        retList.push((ret))
        index += p_num - 1
        p_num = 1
      }
      // 如果p_num-1剩余为5，则生成两个页面 3+2
      else if (p_num - 1 === 5) {
        let ret1 = '', ret2 = ''
        ret1 = JSON.stringify(contentTemplate3)
        ret2 = JSON.stringify(contentTemplate2)
        ret1 = ret1.replace('{{sub_title}}', sub_title)
        ret2 = ret2.replace('{{sub_title}}', sub_title)
        for (let i = 1; i < 4; i++) {
          ret1 = ret1.replace('{{sub_title_content' + i + '}}', p_list[index++].innerHTML)
        }
        for (let i = 4; i < 6; i++) {
          ret2 = ret2.replace('{{sub_title_content' + (i - 3) + '}}', p_list[index++].innerHTML)
        }
        retList.push((ret1))
        retList.push((ret2))
        p_num = 1
      }
      else {
      // 生成一个页面 4
        let ret = ''
        ret = JSON.stringify(contentTemplate4)
        ret = ret.replace('{{sub_title}}', sub_title)
        for (let i = 1; i < 5; i++) {
          ret = ret.replace('{{sub_title_content' + i + '}}', p_list[index++].innerHTML)
        }
        retList.push((ret))

        p_num -= 4
      }
    }
    return retList
  }

  const convert_new_json_to_slide = (json_str:string):Slide => {
    const slide:Slide = JSON.parse(json_str)
    slide.id = nanoid(10)
    // 遍历幻灯片，重置id
    slide.elements.forEach((element:PPTElement) => {
      element.id = nanoid(10)
    })
    console.log('end:', JSON.stringify(slide, null, 4))
    return slide
  }

  const gen_cover = (cover:HTMLElement):Slide => {
    const coverJson = coverReplace(cover)
    return convert_new_json_to_slide(coverJson)
  }

  const gen_catalog = (catalog:HTMLElement):Slide => {
    const coverJson = catalogReplace(catalog)
    return convert_new_json_to_slide(coverJson)
  }

  const gen_content = (content:HTMLElement):Slide[] => {
    const pptList: Slide[] = []
    const contentJsonList:string[] = contentReplace(content)
    for (let j = 0; j < contentJsonList.length; j++) {
      pptList.push(convert_new_json_to_slide(contentJsonList[j]))
    }
    return pptList
  }

  // 处理大纲，根据大纲生成依次生成单页ppt
  const deal_outline = (outline:string): Slide[] => {

    // 定义一个ppt数组
    const pptList: Slide[] = []

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(outline, 'text/xml')
    // 打印<slides>标签下的所有子节点
    const slides = xmlDoc.getElementsByTagName('section')
    // 第一个一定是cover
    const cover = slides[0]
    pptList.push(gen_cover(cover))

    // 第二个一定是目录
    const catalog = slides[1]
    pptList.push(gen_catalog(catalog))

    // 第三个开始是内容
    for (let i = 2; i < slides.length; i++) {
      const content = slides[i]
      const contentJsonList = gen_content(content)
      for (let j = 0; j < contentJsonList.length; j++) {
        pptList.push(contentJsonList[j])
      }
    }

    return pptList
  }
  return {
    deal_outline,
    gen_cover,
    gen_catalog,
    gen_content
  }

}

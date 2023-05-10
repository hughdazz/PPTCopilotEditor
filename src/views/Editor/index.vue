<template>
    <div class="pptist-editor">
        <EditorHeader class="layout-header"/>
        <div class="layout-content">
            <Thumbnails class="layout-content-left"/>
            <div class="layout-content-center">
                <CanvasTool class="center-top"/>
                <Canvas class="center-body" :style="{ height: `calc(100% - ${remarkHeight + 40}px)` }"/>

                <div class="center-bottom">
                    点击扩大
                    <button @click="remarkHeight = 500">^</button>
                    点击缩小
                    <button @click="remarkHeight = 20">-</button>
                    <ChatBox height="480"/>
                </div>
            </div>

            <Toolbar class="layout-content-right"/>

        </div>

    </div>

    <SelectPanel v-if="showSelectPanel"/>

    <Modal
            :visible="!!dialogForExport"
            :footer="null"
            centered
            :closable="false"
            :width="680"
            destroyOnClose
            @cancel="closeExportDialog()"
    >
        <ExportDialog/>
    </Modal>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useMainStore, useSlidesStore} from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
import Remark from './Remark/index.vue'
import GptChat from './GptChat/index.vue'
import ExportDialog from './ExportDialog/index.vue'
import SelectPanel from './SelectPanel.vue'
import {Modal} from 'ant-design-vue'
import ChatBox from '@/components/ChatBox.vue'

import {ElLoading, ElMessageBox} from 'element-plus'
import {Slide} from '@/types/slides'
import useGenPPTByOutline from '@/hooks/useGenPPTByOutline'
import RequestHttp from '@/utils/axiosRequest'
import { guide_slide } from '@/api/ppt_Request_gpt'

const mainStore = useMainStore()
const {dialogForExport, showSelectPanel} = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const slidesStore = useSlidesStore()

const remarkHeight = ref(40)

useGlobalHotkey()
usePasteEvent()

const {
  deal_outline,
  gen_cover,
  gen_catalog,
  gen_content
} = useGenPPTByOutline()

const loading = ElLoading.service({
  lock: true,
  text: '加载中...',
  spinner: 'el-icon-loading',
  background: 'rgba(0, 0, 0, 0.7)'
})

const hideLoading = () => {
  loading.close()
}

const init = () => {

  const loadingEl: HTMLElement = document.querySelector('.el-loading-text') as HTMLElement

  const is_Debug = true
  if (is_Debug) {
    const pptList: Slide[] = []

    const outline = `
<slides><section class='cover'>    <p>我为什么玩明日方舟</p>    <p>汇报人：dhf</p></section><section class='catalog'>    <p>目录</p>    <p>1. 游戏背景</p>    <p>2. 策略玩法</p>    <p>3. 社交互动</p>    <p>4. 良心运营</p>    <p>5. 总结</p></section><section class='content'>    <p>游戏背景</p>    <p>内容概要：介绍游戏的背景设定，讲解人类与感染者的故事背景</p></section><section class='content'>    <p>策略玩法</p>    <p>内容概要：分析游戏的策略性玩法，阵容搭配和技能培养等方面</p></section><section class='content'>    <p>社交互动</p>    <p>内容概要：探讨游戏的社交互动系统，包括公会建设、好友互动等</p></section><section class='content'>    <p>良心运营</p>    <p>内容概要：分享游戏开发者的良心运营理念，以及对玩家的回馈和关怀</p></section><section class='content'>    <p>总结</p>    <p>内容概要：总结自己玩明日方舟的经历和感受，展望未来游戏的发展和可能</p></section></slides>
    `
    hideLoading()

    // 使用domparser解析outline
    const parser = new DOMParser()
    const doc = parser.parseFromString(outline, 'text/xml')
    const slides = doc.getElementsByTagName('slides')
    console.log(slides[0].outerHTML)
    const sectionList = slides[0].getElementsByTagName('section')
    console.log(sectionList[0].outerHTML, sectionList[0].innerHTML)

    const res_xml = [
      ` <section > <p>我为什么玩明日方舟</p> <p>汇报人：dhf</p></section>`,
      `<section class=\\"content\\"><parsererror xmlns=\\"http://www.w3.org/1999/xhtml\\" style=\\"display: block; white-space: pre; border: 2px solid #c77; padding: 0 1em 0 1em; margin: 1em; background-color: #fdd; color: black\\"><h3>This page contains the following errors:</h3><div style=\\"font-family:monospace;font-size:12px\\">error on line 1 at column 174: Extra content at the end of the document\\n</div><h3>Below is a rendering of the page up to the first error.</h3></parsererror>\\n<p>游戏背景</p>\\n<p>1. 本游戏以古代王朝为背景，玩家需要扮演一位王子或公主，统领自己的王国。</p>\\n<p>2. 游戏中有丰富的历史背景设定和故事情节，让玩家沉浸其中。</p>\\n<p>3. 玩家需要面对外敌入侵、内部政治斗争等挑战，保卫自己的王国。</p>\\n</section>`,
      `<section class="content"><p>社交互动</p><p>游戏的社交互动系统对于玩家来说非常重要，因为这可以增加游戏的乐趣和互动性。</p><p>以下是游戏社交互动系统的两个主要方面：</p><p>1. 公会建设</p><p>玩家可以加入一个公会，并与其他玩家一起完成任务、赚取奖励、分享经验等等。公会还可以提供一种友好的社交环境，让玩家们更容易结识新朋友。</p><p>2. 好友互动</p><p>玩家可以添加好友，并与他们一起玩游戏、交流游戏策略、分享游戏经验等等。好友之间还可以进行私聊，增加私人互动性。</p></section>`,
      `<section class=\\"content\\"><p>游戏背景</p><p>本游戏背景设置在末日世界，由一种名为“感染者”的病毒所引发的灾难性事件。这种病毒在人类体内扩散，并不断变异加强，使得感染者变得异常凶残。在这样的背景下，人类不断与感染者进行着殊死搏斗。</p></section>`,
      // `<section class=\\"content\\">\\n<p>游戏背景</p>\\n<p>1. 本游戏设定在未来的世界，由于某种病毒的爆发，人类面临着灭绝的危机。</p>\\n<p>2. 感染者是病毒的携带者，他们具有高度的攻击性和敏捷性，但失去了理智和思维能力。</p>\\n<p>3. 人类为了生存，组织起来进行抵抗，他们需要收集各种资源，建设设施，并寻找病毒的源头，以期找到解决方案。</p>\\n</section>`,
      // `<section class="content"><p>社交互动</p><p>游戏的社交互动系统对于玩家来说非常重要，因为这可以增加游戏的乐趣和互动性。</p><p>以下是游戏社交互动系统的两个主要方面：</p><p>1. 公会建设</p><p>玩家可以加入一个公会，并与其他玩家一起完成任务、赚取奖励、分享经验等等。公会还可以提供一种友好的社交环境，让玩家们更容易结识新朋友。</p><p>2. 好友互动</p><p>玩家可以添加好友，并与他们一起玩游戏、交流游戏策略、分享游戏经验等等。好友之间还可以进行私聊，增加私人互动性。</p></section>`,
      `<section ><p>我为什么玩明日方舟</p><p>1. 养成式游戏的乐趣</p><p>2. 游戏剧情引人入胜</p><p>3. 角色设计独特，画风精美</p><p>4. 社区活跃，与其他玩家互动</p></section>`,
    ]

    // sectionList.length
    for (let i = 0; i < 3; i++) {
      // 请求，进行替换
      console.log(i + 1, '大纲：', sectionList[i].innerHTML)

      const res = [
        '',
        '',
      ]


      console.log((res_xml[i]))

      res_xml[i] = res_xml[i].replace(/\\n/g, '')
      res_xml[i] = res_xml[i].replace(/\\/g, '')
      console.log((res_xml[i]))


      const xmlDoc = parser.parseFromString(res_xml[i], 'text/xml')
      const slides = xmlDoc.getElementsByTagName('section')

      // console.log((slides))

      const outline: HTMLElement = slides[0]
      // SON.parse(JSON.stringify(res.data))

      console.log('获得的页面:', JSON.stringify(outline.outerHTML, null, 4))

      // 替换
      // if (loadingEl) {
      //   loadingEl.innerHTML = (i + 1).toString()
      // }

      // 第一个一定是cover
      if (i === 0) {
        pptList.push(gen_cover(outline))
      }
      else if (i === 1) {// 第二个一定是目录
        pptList.push(gen_catalog(outline))
      }// 第三个开始是内容
      else {
        const ppt_temp_ls = gen_content(outline)
        for (let j = 0; j < ppt_temp_ls.length; j++) {
          pptList.push(ppt_temp_ls[j])
        }
      }

      console.log('渲染结果:', pptList[pptList.length - 1])
      slidesStore.setSlides(pptList)
    }

    // 关闭loadingEl
    hideLoading()
    return
  }

  // if (loadingEl) {
  //   loadingEl.innerHTML = '你好'
  // }

  // 获取路由参数
  const reg = /id=(\d+)/
  const result = window.location.href.match(reg)
  const id = result ? result[1] : ''
  if (loadingEl) {
    loadingEl.innerHTML = result ? result[1] : '没有匹配到'
  }
  // 进行axios请求
  RequestHttp.get('/gpt/outline/' + id).then(res => {

    // 解析res.data
    // { Id:...,Outline:'xxx' }
    const data = JSON.parse(JSON.stringify(res.data))
    const outline = data.Outline
    console.log(outline)
    if (loadingEl) {
      loadingEl.innerHTML = outline
    }
    // 使用domparser解析outline
    const parser = new DOMParser()
    const doc = parser.parseFromString(outline, 'text/xml')
    const slides = doc.getElementsByTagName('slides')
    if (loadingEl) {
      loadingEl.innerHTML = slides.length.toString()
    }
    const sectionList = slides[0].getElementsByTagName('section')
    if (loadingEl) {
      loadingEl.innerHTML = sectionList.length.toString()
    }

    const pptList: Slide[] = []

    async function replaceSections() {
      for (let i = 0; i < sectionList.length; i++) {
        // 请求，进行替换
        if (loadingEl) {
          loadingEl.innerHTML = '正在生成第' + (i + 1) + '页ppt'
        }
        try {
          const res = await guide_slide({
            'outline': sectionList[i].innerHTML
          })

          const r = JSON.parse(JSON.stringify(res))

          let res_xml = r['data']

          res_xml = res_xml.replace(/\\n/g, '')
          res_xml = res_xml.replace(/\\/g, '')
          // res_xml = res_xml.replace('\\', '')

          const xmlDoc = parser.parseFromString(res_xml, 'text/xml')
          const slides = xmlDoc.getElementsByTagName('section')

          const outline:HTMLElement = slides[0]
          // SON.parse(JSON.stringify(res.data))

          console.log('获得第', i + 1, '页大纲:', JSON.stringify(outline.outerHTML, null, 4))

          // 替换

          // 第一个一定是cover
          if (i === 0) {
            pptList.push(gen_cover(outline))
          }
          else if (i === 1) {// 第二个一定是目录
            pptList.push(gen_catalog(outline))
          }// 第三个开始是内容
          else {
            const ppt_temp_ls = gen_content(outline)
            for (let j = 0; j < ppt_temp_ls.length; j++) {
              pptList.push(ppt_temp_ls[j])
            }
          }

          console.log('渲染结果:', pptList[pptList.length - 1])
          slidesStore.setSlides(pptList)
          // sectionList[i].innerHTML = outline
          // console.log(sectionList[i].innerHTML)
        }
        catch (error) {
          console.log(error)
        }
      }
    }

    replaceSections().then(() => {
      // 替换完成，进行保存
      slidesStore.setSlides(pptList)
    })

  })
}

init()

</script>

<style lang="scss" scoped>
.pptist-editor {
  height: 100%;
}

.layout-header {
  height: 40px;
}

.layout-content {
  height: calc(100% - 40px);
  display: flex;
}

.layout-content-left {
  width: 160px;
  height: 100%;
  flex-shrink: 0;
}


.layout-content-center {
  width: calc(100% - 160px - 260px);

  .center-top {
    height: 40px;
  }
}

.layout-content-right {
  width: 260px;
  height: 100%;
}


</style>

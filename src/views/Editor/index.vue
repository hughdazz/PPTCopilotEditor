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
import {useMainStore} from '@/store'
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


const mainStore = useMainStore()
const {dialogForExport, showSelectPanel} = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const remarkHeight = ref(40)

useGlobalHotkey()
usePasteEvent()


</script>

<script lang="ts">
import {ElLoading, ElMessageBox} from 'element-plus'

const loading = ElLoading.service({
  lock: true,
  text: '加载中...',
  spinner: 'el-icon-loading',
  background: 'rgba(0, 0, 0, 0.7)'
})

const hideLoading = () => {
  loading.close()
}

import RequestHttp from '@/utils/axiosRequest'

export default {
  created() {
    const loadingEl = document.querySelector('.el-loading-text')
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

      async function replaceSections() {
        for (let i = 2; i < sectionList.length; i++) {
          // 请求，进行替换
          if (loadingEl) {
            loadingEl.innerHTML = '正在生成第' + i + '页ppt'
          }
          try {
            const res = await RequestHttp.post('/gpt/guide_slide', {
              'outline': sectionList[i].innerHTML
            })
            const outline = JSON.parse(JSON.stringify(res.data))
            // 替换
            sectionList[i].innerHTML = outline
            console.log(sectionList[i].innerHTML)
          }
          catch (error) {
            console.log(error)
          }
        }
      }

      replaceSections().then(() => {
        // 替换完成，进行保存
      })

    })
  }
}


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

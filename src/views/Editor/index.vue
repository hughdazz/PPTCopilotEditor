<template>
    <div class="pptist-editor">
        <EditorHeader class="layout-header"/>
        <div class="layout-content">
            <Thumbnails class="layout-content-left"/>
            <div class="layout-content-center">
                <CanvasTool class="center-top"/>

                <Canvas class="center-body animated-div" :style="{ height: `calc(100% - ${remarkHeight + 40}px)`, transition: 'height 0.5s ease' }"/>
                <transition name="expand">
                    <div v-if="!isExpanded" class="center-bottom expanded" ref="expandedDiv">
                        点击扩大
                        <button @click="expand">^</button>
                    </div>
                    <div v-else class="center-bottom shrunk" ref="shrunkDiv">
                        点击缩小
                        <button @click="shrink">-</button>
                        <ChatBox height="480"/>
                    </div>
                </transition>
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
import {ref, watch, nextTick} from 'vue'
import {storeToRefs} from 'pinia'
import {useMainStore, useSlidesStore} from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
import ExportDialog from './ExportDialog/index.vue'
import SelectPanel from './SelectPanel.vue'
import {Modal} from 'ant-design-vue'
import ChatBox from '@/components/ChatBox.vue'

import {ElLoading, ElMessageBox} from 'element-plus'
import {Slide} from '@/types/slides'
import useGenPPTByOutline from '@/hooks/useGenPPTByOutline'
import RequestHttp from '@/utils/axiosRequest'
import { guide_slide } from '@/api/ppt_Request_gpt'
const loadingInstance0 = ElLoading.service({
  text: '正在启动PPT编辑系统...',
  spinner: 'el-icon-loading',
  background: 'rgba(0, 0, 0, 0.3)'
})

const mainStore = useMainStore()
const {dialogForExport, showSelectPanel} = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const slidesStore = useSlidesStore()

const remarkHeight = ref(40)
const isExpanded = ref(false)

const expand = async () => {
  isExpanded.value = true
  remarkHeight.value = 20
  await nextTick()
  remarkHeight.value = 500
}
const shrink = async () => {
  isExpanded.value = false
  remarkHeight.value = 500
  await nextTick()
  remarkHeight.value = 20
}

useGlobalHotkey()
usePasteEvent()
import useImport from '@/hooks/useImport'
import {encrypt} from '@/utils/crypto'
const {importSpecificFile} = useImport()
loadingInstance0.close()
// 文件导入
window.addEventListener('message', function(event) {
  // 检查消息来源
  if (event.origin !== 'http://123.249.70.216:9529') return
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在导入...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  // 输出或处理接收到的消息
  const data: string = event.data // 虽然定义成string，实际会被自动转为json obj
  console.log(typeof data)
  const blob = new Blob([encrypt(JSON.stringify(data))], { type: '*' })
  console.log('7777 length: ', data.length)
  // 将 Blob 对象转换为 File 对象
  const file = new File([blob], 'test.json')
  // 创建 DataTransfer 对象
  const dataTransfer = new DataTransfer()
  // 将 File 对象添加到 DataTransfer 对象
  dataTransfer.items.add(file)
  // 从 DataTransfer 对象获取 FileList 对象
  const fileList = dataTransfer.files
  importSpecificFile(fileList, true)
  loadingInstance.close()
}, false)

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

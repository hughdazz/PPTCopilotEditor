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
import useImport from '@/hooks/useImport'
const {importSpecificFile} = useImport()

// 文件导入
window.addEventListener('message', function(event) {
  // 检查消息来源
  if (event.origin !== 'http://localhost:9529') return
  // 输出或处理接收到的消息
  const data: string = event.data
  const blob = new Blob([data], { type: '*' })
  console.log('7777 length: ', data.length)
  // 将 Blob 对象转换为 File 对象
  const file = new File([blob], 'this.pptist')
  // 创建 DataTransfer 对象
  const dataTransfer = new DataTransfer()
  // 将 File 对象添加到 DataTransfer 对象
  dataTransfer.items.add(file)
  // 从 DataTransfer 对象获取 FileList 对象
  const fileList = dataTransfer.files
  importSpecificFile(fileList, true)
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

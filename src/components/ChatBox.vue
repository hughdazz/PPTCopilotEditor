<template>
    <div class="chat-box">
        <div class="chat-box-history" ref="history">
            <div v-for="item in chatHistory" :key="item.id">{{ item.content }}</div>
        </div>
        <div class="chat-box-input">
            <el-input v-model="message" placeholder="请输入对话内容" clearable></el-input>
            <el-button type="primary" @click="submitMessage">发送</el-button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue'
import {ElInput, ElButton} from 'element-plus'
import {useSlidesStore} from '@/store'
import {storeToRefs} from 'pinia'

interface ChatHistoryItem {
  id: number;
  content: string;
}


export default defineComponent({
  name: 'ChatBox',
  components: {ElInput, ElButton},
  props: {
    height: {
      type: String,
      default: '300px',
    },
  },
  setup(props) {
    const chatHistory = ref<ChatHistoryItem[]>([])
    const message = ref('')

    const slidesStore = useSlidesStore()
    const {currentSlide} = storeToRefs(slidesStore)

    const submitMessage = () => {
      if (message.value) {
        chatHistory.value.push({
          id: new Date().getTime(),
          content: message.value,
        })
        message.value = ''
        slidesStore.request_update_slides(chatHistory.value[chatHistory.value.length - 1].content)
        scrollToBottom()
      }
    }

    const scrollToBottom = () => {
      const historyEl = document.querySelector('.chat-box-history')
      if (historyEl) {
        historyEl.scrollTop = historyEl.scrollHeight
      }
    }

    onMounted(() => {
      scrollToBottom()
    })

    return {
      chatHistory,
      message,
      submitMessage,
    }
  },
})
</script>

<style scoped>
.chat-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 480px;
}

.chat-box-history {
    flex: 1;
    overflow-y: auto;
}

.chat-box-input {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
}
</style>

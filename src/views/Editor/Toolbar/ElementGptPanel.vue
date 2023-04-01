<template>
  <div>
    123123
    <input>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import { PPTAnimation } from '@/types/slides'

import { ELEMENT_TYPE_ZH } from '@/configs/element'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import { SortableEvent } from 'sortablejs'
import Sortable from '@/components/Sortable.vue'
import {
  InputNumber,
  Divider,
  Button,
  Tooltip,
  Popover,
  Select,
} from 'ant-design-vue'
const SelectOption = Select.Option

const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(useMainStore())
const { currentSlide, formatedAnimations, currentSlideAnimations } = storeToRefs(slidesStore)

</script>

<style lang="scss" scoped>
$inColor: #68a490;
$outColor: #d86344;
$attentionColor: #e8b76a;

.element-animation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tabs {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid $borderColor;
  margin-bottom: 20px;
}
.tab {
  width: 33.33%;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  text-align: center;
  cursor: pointer;

  &.active {
    border-bottom: 2px solid $themeColor;
  }
  &.in.active {
    border-bottom-color: $inColor;
  }
  &.out.active {
    border-bottom-color: $outColor;
  }
  &.attention.active {
    border-bottom-color: $attentionColor;
  }
}
.element-animation {
  height: 32px;
  display: flex;
  align-items: center;
}
.element-animation-btn {
  width: 100%;
}
.config-item {
  display: flex;
  align-items: center;

  & + .config-item {
    margin-top: 5px;
  }
}
.tip {
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-style: italic;
}
.animation-pool {
  width: 400px;
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
  margin-right: -12px;
  position: relative;

  .mask {
    @include absolute-0();
  }

  &.in .type-title {
    border-left-color: $inColor;
    background-color: rgba($color: $inColor, $alpha: .15);
  }
  &.out .type-title {
    border-left-color: $outColor;
    background-color: rgba($color: $outColor, $alpha: .15);
  }
  &.attention .type-title {
    border-left-color: $attentionColor;
    background-color: rgba($color: $attentionColor, $alpha: .15);
  }
}
.type-title {
  width: 100%;
  font-size: 13px;
  margin-bottom: 10px;
  border-left: 4px solid #aaa;
  background-color: #eee;
  padding: 2px 0 2px 10px;
}
.pool-item-wrapper {
  @include flex-grid-layout();
}
.pool-item {
  @include flex-grid-layout-children(4, 24%);

  margin-bottom: 10px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
}
.animation-box {
  background-color: $lightGray;
}

.animation-sequence {
  flex: 1;
  padding-right: 12px;
  margin-right: -12px;

  @include overflow-overlay();
}
.sequence-item {
  border: 1px solid $borderColor;
  padding: 10px 6px;
  border-radius: $borderRadius;
  margin-bottom: 8px;
  transition: all .5s;

  &.in.active {
    border-color: $inColor;
  }
  &.out.active {
    border-color: $outColor;
  }
  &.attention.active {
    border-color: $attentionColor;
  }
  &.active {
    height: auto;
  }

  .sequence-content {
    display: flex;
    align-items: center;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .index {
      flex: 1;
    }
    .text {
      flex: 6;
    }
    .handler {
      flex: 2;
      font-size: 15px;
      text-align: right;
    }
    .handler-btn {
      margin-left: 8px;
      cursor: pointer;
    }
  }
}
</style>
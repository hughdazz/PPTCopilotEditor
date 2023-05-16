import { computed } from 'vue';
export default (width, height) => {
    // 元素缩放点
    const resizeHandlers = computed(() => {
        return [
            { direction: "left-top" /* OperateResizeHandlers.LEFT_TOP */, style: {} },
            { direction: "top" /* OperateResizeHandlers.TOP */, style: { left: width.value / 2 + 'px' } },
            { direction: "right-top" /* OperateResizeHandlers.RIGHT_TOP */, style: { left: width.value + 'px' } },
            { direction: "left" /* OperateResizeHandlers.LEFT */, style: { top: height.value / 2 + 'px' } },
            { direction: "right" /* OperateResizeHandlers.RIGHT */, style: { left: width.value + 'px', top: height.value / 2 + 'px' } },
            { direction: "left-bottom" /* OperateResizeHandlers.LEFT_BOTTOM */, style: { top: height.value + 'px' } },
            { direction: "bottom" /* OperateResizeHandlers.BOTTOM */, style: { left: width.value / 2 + 'px', top: height.value + 'px' } },
            { direction: "right-bottom" /* OperateResizeHandlers.RIGHT_BOTTOM */, style: { left: width.value + 'px', top: height.value + 'px' } },
        ];
    });
    // 文本元素缩放点
    const textElementResizeHandlers = computed(() => {
        return [
            { direction: "left" /* OperateResizeHandlers.LEFT */, style: { top: height.value / 2 + 'px' } },
            { direction: "right" /* OperateResizeHandlers.RIGHT */, style: { left: width.value + 'px', top: height.value / 2 + 'px' } },
        ];
    });
    const verticalTextElementResizeHandlers = computed(() => {
        return [
            { direction: "top" /* OperateResizeHandlers.TOP */, style: { left: width.value / 2 + 'px' } },
            { direction: "bottom" /* OperateResizeHandlers.BOTTOM */, style: { left: width.value / 2 + 'px', top: height.value + 'px' } },
        ];
    });
    // 元素选中边框线
    const borderLines = computed(() => {
        return [
            { type: "top" /* OperateBorderLines.T */, style: { width: width.value + 'px' } },
            { type: "bottom" /* OperateBorderLines.B */, style: { top: height.value + 'px', width: width.value + 'px' } },
            { type: "left" /* OperateBorderLines.L */, style: { height: height.value + 'px' } },
            { type: "right" /* OperateBorderLines.R */, style: { left: width.value + 'px', height: height.value + 'px' } },
        ];
    });
    return {
        resizeHandlers,
        textElementResizeHandlers,
        verticalTextElementResizeHandlers,
        borderLines,
    };
};
//# sourceMappingURL=useCommonOperate.js.map
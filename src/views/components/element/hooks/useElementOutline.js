import { computed } from 'vue';
// 计算边框相关属性值，主要是对默认值的处理
export default (outline) => {
    const outlineWidth = computed(() => outline.value?.width ?? 0);
    const outlineStyle = computed(() => outline.value?.style || 'solid');
    const outlineColor = computed(() => outline.value?.color || '#d14424');
    return {
        outlineWidth,
        outlineStyle,
        outlineColor,
    };
};
//# sourceMappingURL=useElementOutline.js.map
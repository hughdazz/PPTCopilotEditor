import { computed } from 'vue';
// 计算元素的阴影样式
export default (shadow) => {
    const shadowStyle = computed(() => {
        if (shadow.value) {
            const { h, v, blur, color } = shadow.value;
            return `${h}px ${v}px ${blur}px ${color}`;
        }
        return '';
    });
    return {
        shadowStyle,
    };
};
//# sourceMappingURL=useElementShadow.js.map
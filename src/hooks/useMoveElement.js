import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
export default () => {
    const slidesStore = useSlidesStore();
    const { activeElementIdList, activeGroupElementId } = storeToRefs(useMainStore());
    const { currentSlide } = storeToRefs(slidesStore);
    const { addHistorySnapshot } = useHistorySnapshot();
    /**
     * 将元素向指定方向移动指定的距离
     * 组合元素成员中，存在被选中可独立操作的元素时，优先移动该元素。否则默认移动所有被选中的元素
     * @param command 移动方向
     * @param step 移动距离
     */
    const moveElement = (command, step = 1) => {
        let newElementList = [];
        const move = (el) => {
            let { left, top } = el;
            switch (command) {
                case "ARROWLEFT" /* KEYS.LEFT */:
                    left = left - step;
                    break;
                case "ARROWRIGHT" /* KEYS.RIGHT */:
                    left = left + step;
                    break;
                case "ARROWUP" /* KEYS.UP */:
                    top = top - step;
                    break;
                case "ARROWDOWN" /* KEYS.DOWN */:
                    top = top + step;
                    break;
                default: break;
            }
            return { ...el, left, top };
        };
        if (activeGroupElementId.value) {
            newElementList = currentSlide.value.elements.map(el => {
                return activeGroupElementId.value === el.id ? move(el) : el;
            });
        }
        else {
            newElementList = currentSlide.value.elements.map(el => {
                return activeElementIdList.value.includes(el.id) ? move(el) : el;
            });
        }
        slidesStore.updateSlide({ elements: newElementList });
        addHistorySnapshot();
    };
    return {
        moveElement,
    };
};
//# sourceMappingURL=useMoveElement.js.map
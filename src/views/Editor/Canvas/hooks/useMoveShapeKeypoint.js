import { useSlidesStore } from '@/store';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import { SHAPE_PATH_FORMULAS } from '@/configs/shapes';
export default (elementList, canvasScale) => {
    const slidesStore = useSlidesStore();
    const { addHistorySnapshot } = useHistorySnapshot();
    const moveShapeKeypoint = (e, element) => {
        const isTouchEvent = !(e instanceof MouseEvent);
        if (isTouchEvent && (!e.changedTouches || !e.changedTouches[0]))
            return;
        let isMouseDown = true;
        const startPageX = isTouchEvent ? e.changedTouches[0].pageX : e.pageX;
        const startPageY = isTouchEvent ? e.changedTouches[0].pageY : e.pageY;
        const pathFormula = SHAPE_PATH_FORMULAS[element.pathFormula];
        let shapePathData = null;
        if ('editable' in pathFormula) {
            const baseSize = pathFormula.getBaseSize(element.width, element.height);
            const originPos = baseSize * element.keypoint;
            const [min, max] = pathFormula.range;
            const relative = pathFormula.relative;
            shapePathData = { baseSize, originPos, min, max, relative };
        }
        const handleMousemove = (e) => {
            if (!isMouseDown)
                return;
            const currentPageX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
            const currentPageY = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;
            const moveX = (currentPageX - startPageX) / canvasScale.value;
            const moveY = (currentPageY - startPageY) / canvasScale.value;
            elementList.value = elementList.value.map(el => {
                if (el.id === element.id && shapePathData) {
                    const { baseSize, originPos, min, max, relative } = shapePathData;
                    const shapeElement = el;
                    let keypoint = 0;
                    if (relative === 'left')
                        keypoint = (originPos + moveX) / baseSize;
                    if (relative === 'right')
                        keypoint = (originPos - moveX) / baseSize;
                    if (relative === 'center')
                        keypoint = (originPos - moveX * 2) / baseSize;
                    if (relative === 'top')
                        keypoint = (originPos + moveY) / baseSize;
                    if (relative === 'bottom')
                        keypoint = (originPos - moveY) / baseSize;
                    if (keypoint < min)
                        keypoint = min;
                    if (keypoint > max)
                        keypoint = max;
                    return {
                        ...el,
                        keypoint,
                        path: pathFormula.formula(shapeElement.width, shapeElement.height, keypoint),
                    };
                }
                return el;
            });
        };
        const handleMouseup = (e) => {
            isMouseDown = false;
            document.ontouchmove = null;
            document.ontouchend = null;
            document.onmousemove = null;
            document.onmouseup = null;
            const currentPageX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
            const currentPageY = e instanceof MouseEvent ? e.pageY : e.changedTouches[0].pageY;
            if (startPageX === currentPageX && startPageY === currentPageY)
                return;
            slidesStore.updateSlide({ elements: elementList.value });
            addHistorySnapshot();
        };
        if (isTouchEvent) {
            document.ontouchmove = handleMousemove;
            document.ontouchend = handleMouseup;
        }
        else {
            document.onmousemove = handleMousemove;
            document.onmouseup = handleMouseup;
        }
    };
    return {
        moveShapeKeypoint,
    };
};
//# sourceMappingURL=useMoveShapeKeypoint.js.map
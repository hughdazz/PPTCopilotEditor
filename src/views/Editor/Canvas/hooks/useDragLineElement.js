import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
export default (elementList) => {
    const slidesStore = useSlidesStore();
    const { canvasScale } = storeToRefs(useMainStore());
    const { addHistorySnapshot } = useHistorySnapshot();
    // 拖拽线条端点
    const dragLineElement = (e, element, command) => {
        let isMouseDown = true;
        const sorptionRange = 8;
        const startPageX = e.pageX;
        const startPageY = e.pageY;
        const adsorptionPoints = [];
        // 获取所有线条以外的未旋转的元素的8个缩放点作为吸附位置
        for (let i = 0; i < elementList.value.length; i++) {
            const _element = elementList.value[i];
            if (_element.type === 'line' || _element.rotate)
                continue;
            const left = _element.left;
            const top = _element.top;
            const width = _element.width;
            const height = _element.height;
            const right = left + width;
            const bottom = top + height;
            const centerX = top + height / 2;
            const centerY = left + width / 2;
            const topPoint = { x: centerY, y: top };
            const bottomPoint = { x: centerY, y: bottom };
            const leftPoint = { x: left, y: centerX };
            const rightPoint = { x: right, y: centerX };
            const leftTopPoint = { x: left, y: top };
            const rightTopPoint = { x: right, y: top };
            const leftBottomPoint = { x: left, y: bottom };
            const rightBottomPoint = { x: right, y: bottom };
            adsorptionPoints.push(topPoint, bottomPoint, leftPoint, rightPoint, leftTopPoint, rightTopPoint, leftBottomPoint, rightBottomPoint);
        }
        document.onmousemove = e => {
            if (!isMouseDown)
                return;
            const currentPageX = e.pageX;
            const currentPageY = e.pageY;
            const moveX = (currentPageX - startPageX) / canvasScale.value;
            const moveY = (currentPageY - startPageY) / canvasScale.value;
            // 线条起点和终点在编辑区域中的位置
            let startX = element.left + element.start[0];
            let startY = element.top + element.start[1];
            let endX = element.left + element.end[0];
            let endY = element.top + element.end[1];
            const mid = element.broken || element.curve || [0, 0];
            let midX = element.left + mid[0];
            let midY = element.top + mid[1];
            const [c1, c2] = element.cubic || [[0, 0], [0, 0]];
            let c1X = element.left + c1[0];
            let c1Y = element.top + c1[1];
            let c2X = element.left + c2[0];
            let c2Y = element.top + c2[1];
            // 拖拽起点或终点的位置
            // 水平和垂直方向上有吸附
            if (command === "start" /* OperateLineHandlers.START */) {
                startX = startX + moveX;
                startY = startY + moveY;
                if (Math.abs(startX - endX) < sorptionRange)
                    startX = endX;
                if (Math.abs(startY - endY) < sorptionRange)
                    startY = endY;
                for (const adsorptionPoint of adsorptionPoints) {
                    const { x, y } = adsorptionPoint;
                    if (Math.abs(x - startX) < sorptionRange && Math.abs(y - startY) < sorptionRange) {
                        startX = x;
                        startY = y;
                        break;
                    }
                }
            }
            else if (command === "end" /* OperateLineHandlers.END */) {
                endX = endX + moveX;
                endY = endY + moveY;
                if (Math.abs(startX - endX) < sorptionRange)
                    endX = startX;
                if (Math.abs(startY - endY) < sorptionRange)
                    endY = startY;
                for (const adsorptionPoint of adsorptionPoints) {
                    const { x, y } = adsorptionPoint;
                    if (Math.abs(x - endX) < sorptionRange && Math.abs(y - endY) < sorptionRange) {
                        endX = x;
                        endY = y;
                        break;
                    }
                }
            }
            else if (command === "ctrl" /* OperateLineHandlers.C */) {
                midX = midX + moveX;
                midY = midY + moveY;
                if (Math.abs(midX - startX) < sorptionRange)
                    midX = startX;
                if (Math.abs(midY - startY) < sorptionRange)
                    midY = startY;
                if (Math.abs(midX - endX) < sorptionRange)
                    midX = endX;
                if (Math.abs(midY - endY) < sorptionRange)
                    midY = endY;
                if (Math.abs(midX - (startX + endX) / 2) < sorptionRange && Math.abs(midY - (startY + endY) / 2) < sorptionRange) {
                    midX = (startX + endX) / 2;
                    midY = (startY + endY) / 2;
                }
            }
            else if (command === "ctrl1" /* OperateLineHandlers.C1 */) {
                c1X = c1X + moveX;
                c1Y = c1Y + moveY;
                if (Math.abs(c1X - startX) < sorptionRange)
                    c1X = startX;
                if (Math.abs(c1Y - startY) < sorptionRange)
                    c1Y = startY;
                if (Math.abs(c1X - endX) < sorptionRange)
                    c1X = endX;
                if (Math.abs(c1Y - endY) < sorptionRange)
                    c1Y = endY;
            }
            else if (command === "ctrl2" /* OperateLineHandlers.C2 */) {
                c2X = c2X + moveX;
                c2Y = c2Y + moveY;
                if (Math.abs(c2X - startX) < sorptionRange)
                    c2X = startX;
                if (Math.abs(c2Y - startY) < sorptionRange)
                    c2Y = startY;
                if (Math.abs(c2X - endX) < sorptionRange)
                    c2X = endX;
                if (Math.abs(c2Y - endY) < sorptionRange)
                    c2Y = endY;
            }
            // 计算更新起点和终点基于自身元素位置的坐标
            const minX = Math.min(startX, endX);
            const minY = Math.min(startY, endY);
            const maxX = Math.max(startX, endX);
            const maxY = Math.max(startY, endY);
            const start = [0, 0];
            const end = [maxX - minX, maxY - minY];
            if (startX > endX) {
                start[0] = maxX - minX;
                end[0] = 0;
            }
            if (startY > endY) {
                start[1] = maxY - minY;
                end[1] = 0;
            }
            elementList.value = elementList.value.map(el => {
                if (el.id === element.id) {
                    const newEl = {
                        ...el,
                        left: minX,
                        top: minY,
                        start: start,
                        end: end,
                    };
                    if (command === "start" /* OperateLineHandlers.START */ || command === "end" /* OperateLineHandlers.END */) {
                        if (element.broken)
                            newEl.broken = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
                        if (element.curve)
                            newEl.curve = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
                        if (element.cubic)
                            newEl.cubic = [[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2], [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]];
                    }
                    else if (command === "ctrl" /* OperateLineHandlers.C */) {
                        if (element.broken)
                            newEl.broken = [midX - minX, midY - minY];
                        if (element.curve)
                            newEl.curve = [midX - minX, midY - minY];
                    }
                    else {
                        if (element.cubic)
                            newEl.cubic = [[c1X - minX, c1Y - minY], [c2X - minX, c2Y - minY]];
                    }
                    return newEl;
                }
                return el;
            });
        };
        document.onmouseup = e => {
            isMouseDown = false;
            document.onmousemove = null;
            document.onmouseup = null;
            const currentPageX = e.pageX;
            const currentPageY = e.pageY;
            if (startPageX === currentPageX && startPageY === currentPageY)
                return;
            slidesStore.updateSlide({ elements: elementList.value });
            addHistorySnapshot();
        };
    };
    return {
        dragLineElement,
    };
};
//# sourceMappingURL=useDragLineElement.js.map
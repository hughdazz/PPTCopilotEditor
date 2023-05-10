import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store';
import { ElementOrderCommands } from '@/types/edit';
import useSlideHandler from './useSlideHandler';
import useLockElement from './useLockElement';
import useDeleteElement from './useDeleteElement';
import useCombineElement from './useCombineElement';
import useCopyAndPasteElement from './useCopyAndPasteElement';
import useSelectAllElement from './useSelectAllElement';
import useMoveElement from './useMoveElement';
import useOrderElement from './useOrderElement';
import useHistorySnapshot from './useHistorySnapshot';
import useScreening from './useScreening';
import useScaleCanvas from './useScaleCanvas';
export default () => {
    const mainStore = useMainStore();
    const keyboardStore = useKeyboardStore();
    const { activeElementIdList, disableHotkeys, handleElement, handleElementId, editorAreaFocus, thumbnailsFocus, } = storeToRefs(mainStore);
    const { currentSlide } = storeToRefs(useSlidesStore());
    const { ctrlKeyState, shiftKeyState, spaceKeyState } = storeToRefs(keyboardStore);
    const { updateSlideIndex, copySlide, createSlide, deleteSlide, cutSlide, copyAndPasteSlide, selectAllSlide, } = useSlideHandler();
    const { combineElements, uncombineElements } = useCombineElement();
    const { deleteElement } = useDeleteElement();
    const { lockElement } = useLockElement();
    const { copyElement, cutElement, quickCopyElement } = useCopyAndPasteElement();
    const { selectAllElement } = useSelectAllElement();
    const { moveElement } = useMoveElement();
    const { orderElement } = useOrderElement();
    const { redo, undo } = useHistorySnapshot();
    const { enterScreening, enterScreeningFromStart } = useScreening();
    const { scaleCanvas, resetCanvas } = useScaleCanvas();
    const copy = () => {
        if (activeElementIdList.value.length)
            copyElement();
        else if (thumbnailsFocus.value)
            copySlide();
    };
    const cut = () => {
        if (activeElementIdList.value.length)
            cutElement();
        else if (thumbnailsFocus.value)
            cutSlide();
    };
    const quickCopy = () => {
        if (activeElementIdList.value.length)
            quickCopyElement();
        else if (thumbnailsFocus.value)
            copyAndPasteSlide();
    };
    const selectAll = () => {
        if (editorAreaFocus.value)
            selectAllElement();
        if (thumbnailsFocus.value)
            selectAllSlide();
    };
    const lock = () => {
        if (!editorAreaFocus.value)
            return;
        lockElement();
    };
    const combine = () => {
        if (!editorAreaFocus.value)
            return;
        combineElements();
    };
    const uncombine = () => {
        if (!editorAreaFocus.value)
            return;
        uncombineElements();
    };
    const remove = () => {
        if (activeElementIdList.value.length)
            deleteElement();
        else if (thumbnailsFocus.value)
            deleteSlide();
    };
    const move = (key) => {
        if (activeElementIdList.value.length)
            moveElement(key);
        else if (key === "ARROWUP" /* KEYS.UP */ || key === "ARROWDOWN" /* KEYS.DOWN */)
            updateSlideIndex(key);
    };
    const moveSlide = (key) => {
        if (key === "PAGEUP" /* KEYS.PAGEUP */)
            updateSlideIndex("ARROWUP" /* KEYS.UP */);
        else if (key === "PAGEDOWN" /* KEYS.PAGEDOWN */)
            updateSlideIndex("ARROWDOWN" /* KEYS.DOWN */);
    };
    const order = (command) => {
        if (!handleElement.value)
            return;
        orderElement(handleElement.value, command);
    };
    const create = () => {
        if (!thumbnailsFocus.value)
            return;
        createSlide();
    };
    const tabActiveElement = () => {
        if (!currentSlide.value.elements.length)
            return;
        if (!handleElementId.value) {
            const firstElement = currentSlide.value.elements[0];
            mainStore.setActiveElementIdList([firstElement.id]);
            return;
        }
        const currentIndex = currentSlide.value.elements.findIndex(el => el.id === handleElementId.value);
        const nextIndex = currentIndex >= currentSlide.value.elements.length - 1 ? 0 : currentIndex + 1;
        const nextElementId = currentSlide.value.elements[nextIndex].id;
        mainStore.setActiveElementIdList([nextElementId]);
    };
    const keydownListener = (e) => {
        const { ctrlKey, shiftKey, altKey, metaKey } = e;
        const ctrlOrMetaKeyActive = ctrlKey || metaKey;
        const key = e.key.toUpperCase();
        if (ctrlOrMetaKeyActive && !ctrlKeyState.value)
            keyboardStore.setCtrlKeyState(true);
        if (shiftKey && !shiftKeyState.value)
            keyboardStore.setShiftKeyState(true);
        if (!disableHotkeys.value && key === " " /* KEYS.SPACE */)
            keyboardStore.setSpaceKeyState(true);
        if (ctrlOrMetaKeyActive && key === "P" /* KEYS.P */) {
            e.preventDefault();
            mainStore.setDialogForExport('pdf');
            return;
        }
        if (shiftKey && key === "F5" /* KEYS.F5 */) {
            e.preventDefault();
            enterScreening();
            keyboardStore.setShiftKeyState(false);
            return;
        }
        if (key === "F5" /* KEYS.F5 */) {
            e.preventDefault();
            enterScreeningFromStart();
            return;
        }
        if (!editorAreaFocus.value && !thumbnailsFocus.value)
            return;
        if (ctrlOrMetaKeyActive && key === "C" /* KEYS.C */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            copy();
        }
        if (ctrlOrMetaKeyActive && key === "X" /* KEYS.X */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            cut();
        }
        if (ctrlOrMetaKeyActive && key === "D" /* KEYS.D */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            quickCopy();
        }
        if (ctrlOrMetaKeyActive && key === "Z" /* KEYS.Z */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            undo();
        }
        if (ctrlOrMetaKeyActive && key === "Y" /* KEYS.Y */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            redo();
        }
        if (ctrlOrMetaKeyActive && key === "A" /* KEYS.A */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            selectAll();
        }
        if (ctrlOrMetaKeyActive && key === "L" /* KEYS.L */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            lock();
        }
        if (!shiftKey && ctrlOrMetaKeyActive && key === "G" /* KEYS.G */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            combine();
        }
        if (shiftKey && ctrlOrMetaKeyActive && key === "G" /* KEYS.G */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            uncombine();
        }
        if (altKey && key === "F" /* KEYS.F */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            order(ElementOrderCommands.TOP);
        }
        if (altKey && key === "B" /* KEYS.B */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            order(ElementOrderCommands.BOTTOM);
        }
        if (key === "DELETE" /* KEYS.DELETE */ || key === "BACKSPACE" /* KEYS.BACKSPACE */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            remove();
        }
        if (key === "ARROWUP" /* KEYS.UP */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            move("ARROWUP" /* KEYS.UP */);
        }
        if (key === "ARROWDOWN" /* KEYS.DOWN */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            move("ARROWDOWN" /* KEYS.DOWN */);
        }
        if (key === "ARROWLEFT" /* KEYS.LEFT */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            move("ARROWLEFT" /* KEYS.LEFT */);
        }
        if (key === "ARROWRIGHT" /* KEYS.RIGHT */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            move("ARROWRIGHT" /* KEYS.RIGHT */);
        }
        if (key === "PAGEUP" /* KEYS.PAGEUP */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            moveSlide("PAGEUP" /* KEYS.PAGEUP */);
        }
        if (key === "PAGEDOWN" /* KEYS.PAGEDOWN */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            moveSlide("PAGEDOWN" /* KEYS.PAGEDOWN */);
        }
        if (key === "ENTER" /* KEYS.ENTER */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            create();
        }
        if (key === "-" /* KEYS.MINUS */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            scaleCanvas('-');
        }
        if (key === "=" /* KEYS.EQUAL */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            scaleCanvas('+');
        }
        if (key === "0" /* KEYS.DIGIT_0 */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            resetCanvas();
        }
        if (key === "TAB" /* KEYS.TAB */) {
            if (disableHotkeys.value)
                return;
            e.preventDefault();
            tabActiveElement();
        }
    };
    const keyupListener = () => {
        if (ctrlKeyState.value)
            keyboardStore.setCtrlKeyState(false);
        if (shiftKeyState.value)
            keyboardStore.setShiftKeyState(false);
        if (spaceKeyState.value)
            keyboardStore.setSpaceKeyState(false);
    };
    onMounted(() => {
        document.addEventListener('keydown', keydownListener);
        document.addEventListener('keyup', keyupListener);
        window.addEventListener('blur', keyupListener);
    });
    onUnmounted(() => {
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyupListener);
        window.removeEventListener('blur', keyupListener);
    });
};
//# sourceMappingURL=useGlobalHotkey.js.map
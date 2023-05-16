import { customAlphabet } from 'nanoid';
import { defineStore } from 'pinia';
import { SYS_FONTS } from '@/configs/font';
import { defaultRichTextAttrs } from '@/utils/prosemirror/utils';
import { isSupportFont } from '@/utils/font';
import { useSlidesStore } from './slides';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
export const databaseId = nanoid(10);
export const useMainStore = defineStore('main', {
    state: () => ({
        activeElementIdList: [],
        handleElementId: '',
        activeGroupElementId: '',
        hiddenElementIdList: [],
        canvasPercentage: 90,
        canvasScale: 1,
        canvasDragged: false,
        thumbnailsFocus: false,
        editorAreaFocus: false,
        disableHotkeys: false,
        gridLineSize: 0,
        showRuler: false,
        creatingElement: null,
        availableFonts: SYS_FONTS,
        toolbarState: "slideDesign" /* ToolbarStates.SLIDE_DESIGN */,
        clipingImageElementId: '',
        richTextAttrs: defaultRichTextAttrs,
        selectedTableCells: [],
        isScaling: false,
        selectedSlidesIndex: [],
        dialogForExport: '',
        databaseId,
        textFormatPainter: null,
        showSelectPanel: false, // 打开选择面板
    }),
    getters: {
        activeElementList(state) {
            const slidesStore = useSlidesStore();
            const currentSlide = slidesStore.currentSlide;
            if (!currentSlide || !currentSlide.elements)
                return [];
            return currentSlide.elements.filter(element => state.activeElementIdList.includes(element.id));
        },
        handleElement(state) {
            const slidesStore = useSlidesStore();
            const currentSlide = slidesStore.currentSlide;
            if (!currentSlide || !currentSlide.elements)
                return null;
            return currentSlide.elements.find(element => state.handleElementId === element.id) || null;
        },
    },
    actions: {
        setActiveElementIdList(activeElementIdList) {
            if (activeElementIdList.length === 1)
                this.handleElementId = activeElementIdList[0];
            else
                this.handleElementId = '';
            this.activeElementIdList = activeElementIdList;
        },
        setHandleElementId(handleElementId) {
            this.handleElementId = handleElementId;
        },
        setActiveGroupElementId(activeGroupElementId) {
            this.activeGroupElementId = activeGroupElementId;
        },
        setHiddenElementIdList(hiddenElementIdList) {
            this.hiddenElementIdList = hiddenElementIdList;
        },
        setCanvasPercentage(percentage) {
            this.canvasPercentage = percentage;
        },
        setCanvasScale(scale) {
            this.canvasScale = scale;
        },
        setCanvasDragged(isDragged) {
            this.canvasDragged = isDragged;
        },
        setThumbnailsFocus(isFocus) {
            this.thumbnailsFocus = isFocus;
        },
        setEditorareaFocus(isFocus) {
            this.editorAreaFocus = isFocus;
        },
        setDisableHotkeysState(disable) {
            this.disableHotkeys = disable;
        },
        setGridLineSize(size) {
            this.gridLineSize = size;
        },
        setRulerState(show) {
            this.showRuler = show;
        },
        setCreatingElement(element) {
            this.creatingElement = element;
        },
        setAvailableFonts() {
            this.availableFonts = SYS_FONTS.filter(font => isSupportFont(font.value));
        },
        setToolbarState(toolbarState) {
            this.toolbarState = toolbarState;
        },
        setClipingImageElementId(elId) {
            this.clipingImageElementId = elId;
        },
        setRichtextAttrs(attrs) {
            this.richTextAttrs = attrs;
        },
        setSelectedTableCells(cells) {
            this.selectedTableCells = cells;
        },
        setScalingState(isScaling) {
            this.isScaling = isScaling;
        },
        updateSelectedSlidesIndex(selectedSlidesIndex) {
            this.selectedSlidesIndex = selectedSlidesIndex;
        },
        setDialogForExport(type) {
            this.dialogForExport = type;
        },
        setTextFormatPainter(textFormatPainter) {
            this.textFormatPainter = textFormatPainter;
        },
        setSelectPanelState(show) {
            this.showSelectPanel = show;
        },
    },
});
//# sourceMappingURL=main.js.map
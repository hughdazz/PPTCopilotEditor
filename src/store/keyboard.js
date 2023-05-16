import { defineStore } from 'pinia';
export const useKeyboardStore = defineStore('keyboard', {
    state: () => ({
        ctrlKeyState: false,
        shiftKeyState: false,
        spaceKeyState: false, // space键按下状态
    }),
    getters: {
        ctrlOrShiftKeyActive(state) {
            return state.ctrlKeyState || state.shiftKeyState;
        },
    },
    actions: {
        setCtrlKeyState(active) {
            this.ctrlKeyState = active;
        },
        setShiftKeyState(active) {
            this.shiftKeyState = active;
        },
        setSpaceKeyState(active) {
            this.spaceKeyState = active;
        },
    },
});
//# sourceMappingURL=keyboard.js.map
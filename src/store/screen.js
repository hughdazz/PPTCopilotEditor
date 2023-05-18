import { defineStore } from 'pinia';
export const useScreenStore = defineStore('screen', {
    state: () => ({
        screening: false, // 是否进入放映状态
    }),
    actions: {
        setScreening(screening) {
            this.screening = screening;
        },
    },
});
//# sourceMappingURL=screen.js.map
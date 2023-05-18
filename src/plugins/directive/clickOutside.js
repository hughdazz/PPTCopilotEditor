const CTX_CLICK_OUTSIDE_HANDLER = 'CTX_CLICK_OUTSIDE_HANDLER';
const clickListener = (el, event, binding) => {
    const handler = binding.value;
    const path = event.composedPath();
    const isClickOutside = path ? path.indexOf(el) < 0 : !el.contains(event.target);
    if (!isClickOutside)
        return;
    handler(event);
};
const ClickOutsideDirective = {
    mounted(el, binding) {
        el[CTX_CLICK_OUTSIDE_HANDLER] = (event) => clickListener(el, event, binding);
        setTimeout(() => {
            document.addEventListener('click', el[CTX_CLICK_OUTSIDE_HANDLER]);
        }, 0);
    },
    unmounted(el) {
        if (el[CTX_CLICK_OUTSIDE_HANDLER]) {
            document.removeEventListener('click', el[CTX_CLICK_OUTSIDE_HANDLER]);
            delete el[CTX_CLICK_OUTSIDE_HANDLER];
        }
    },
};
export default ClickOutsideDirective;
//# sourceMappingURL=clickOutside.js.map
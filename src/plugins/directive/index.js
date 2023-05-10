import Contextmenu from './contextmenu';
import ClickOutside from './clickOutside';
export default {
    install(app) {
        app.directive('contextmenu', Contextmenu);
        app.directive('click-outside', ClickOutside);
    }
};
//# sourceMappingURL=index.js.map
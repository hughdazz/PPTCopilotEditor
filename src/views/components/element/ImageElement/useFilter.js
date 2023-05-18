import { computed } from 'vue';
export default (filters) => {
    const filter = computed(() => {
        if (!filters.value)
            return '';
        let filter = '';
        for (const key of Object.keys(filters.value)) {
            filter += `${key}(${filters.value[key]}) `;
        }
        return filter;
    });
    return {
        filter,
    };
};
//# sourceMappingURL=useFilter.js.map
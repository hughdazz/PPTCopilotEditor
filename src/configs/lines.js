export const LINE_LIST = [
    {
        type: '直线',
        children: [
            { path: 'M 0 0 L 20 20', style: 'solid', points: ['', ''] },
            { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', ''] },
            { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'arrow'] },
            { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', 'arrow'] },
            { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'dot'] },
        ],
    },
    {
        type: '折线、曲线',
        children: [
            { path: 'M 0 0 L 0 20 L 20 20', style: 'solid', points: ['', 'arrow'], isBroken: true },
            { path: 'M 0 0 Q 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCurve: true },
            { path: 'M 0 0 C 20 0 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCubic: true },
        ],
    },
];
//# sourceMappingURL=lines.js.map
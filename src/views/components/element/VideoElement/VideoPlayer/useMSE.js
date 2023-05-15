/* eslint-disable */
import { onMounted } from 'vue';
export default (src, videoRef) => {
    onMounted(() => {
        if (!videoRef.value)
            return;
        let type = 'normal';
        if (/m3u8(#|\?|$)/i.exec(src))
            type = 'hls';
        else if (/.flv(#|\?|$)/i.exec(src))
            type = 'flv';
        if (videoRef.value && type === 'hls' && (videoRef.value.canPlayType('application/x-mpegURL') || videoRef.value.canPlayType('application/vnd.apple.mpegURL'))) {
            type = 'normal';
        }
        if (type === 'hls') {
            const Hls = window.Hls;
            if (Hls && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoRef.value);
            }
        }
        else if (type === 'flv') {
            const flvjs = window.flvjs;
            if (flvjs && flvjs.isSupported()) {
                const flvPlayer = flvjs.createPlayer({
                    type: 'flv',
                    url: src,
                });
                flvPlayer.attachMediaElement(videoRef.value);
                flvPlayer.load();
            }
        }
    });
};
//# sourceMappingURL=useMSE.js.map
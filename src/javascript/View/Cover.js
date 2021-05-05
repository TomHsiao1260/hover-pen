export default class Cover {
    constructor(_option) {
        this.$content = _option.$content;

        this.setDOM();
    }

    setDOM() {
        this.$next = document.createElement('DIV');
        this.$next.className = 'next';
        this.$next.style.opacity = 0;
        this.$next.style.display = 'none';
        this.$nextText = document.createElement('DIV');
        this.$nextText.className = 'text';
        this.$nextText.innerText = 'next';

        this.$markSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.$markSVG.setAttributeNS(null, 'viewBox', '0 0 100 50');

        this.$markPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.$markPath.setAttributeNS(null, 'd', 'M10 10 L50 40 L90 10');
        this.$markPath.setAttributeNS(null, 'fill-opacity', 0);
        this.$markPath.setAttributeNS(null, 'stroke-width', 5);
        this.$markPath.setAttributeNS(null, 'class', 'path');
        this.$markSVG.appendChild(this.$markPath);

        this.$content.appendChild(this.$next);
        this.$next.appendChild(this.$nextText);
        this.$next.appendChild(this.$markSVG);
    }

    async visible() {
        this.$next.style.display = 'flex';
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.$next.style.opacity = 1.0;
    }

    async hidden() {
        this.$next.style.opacity = 0;
        this.$next.style.display = 'none';
    }
}

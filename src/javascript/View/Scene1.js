export default class Scene1 {
    constructor(_option) {
        this.$content = _option.$content;
        this.sizes = _option.sizes;

        this.setParameters();
        this.setDOM();
    }

    setParameters() {
        this.text = [];
        this.text1 = {};
        this.text2 = {};
        this.text.push(this.text1);
        this.text.push(this.text2);

        this.text1.name = 'text1';
        this.text1.innerText = 'An Unique Decoration';
        this.text1.config = { top: '18%', right: '13%' };

        this.text2.name = 'text2';
        this.text2.innerText = 'Inspire your Creativity';
        this.text2.config = { bottom: '22%', left: '13%' };

        // texts positioning parameters (on mobile)
        if (this.sizes.width < 768) {
            this.text1.config = { top: '22%', right: '3%' };
            this.text2.config = { bottom: '20%', left: '3%' };
        }
    }

    setDOM() {
        this.text.forEach((value) => {
            const text = value;

            text.$point = document.createElement('DIV');
            text.$point.className = 'text';
            text.$point.style.display = 'none';
            text.$point.style.opacity = 0;

            text.$blink = document.createElement('DIV');
            text.$blink.className = 'blink';
            text.$blink.innerText = text.innerText;
            text.$blink.style.top = text.config.top;
            text.$blink.style.bottom = text.config.bottom;
            text.$blink.style.right = text.config.right;
            text.$blink.style.left = text.config.left;

            this.$content.appendChild(text.$point);
            text.$point.appendChild(text.$blink);
        });
    }

    async visible() {
        this.text.forEach(async (value) => {
            const text = value;
            text.$point.style.display = 'inline';

            if (text.$blink.style.right) text.$blink.style.transform = 'translateX(20%)';
            if (text.$blink.style.left) text.$blink.style.transform = 'translateX(-20%)';

            await new Promise((resolve) => setTimeout(resolve, 100));

            text.$point.style.opacity = 0.6;
            text.$blink.style.transform = 'translateX(0)';
        });
    }

    async hidden() {
        this.text.forEach(async (value) => {
            const text = value;
            text.$point.style.opacity = 0;
            await new Promise((resolve) => setTimeout(resolve, 5000));
            text.$point.style.display = 'none';
        });
    }
}

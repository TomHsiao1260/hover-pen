import Cover from './Cover';

export default class View {
    constructor() {
        this.$content = document.querySelector('.content');

        this.setCover();
    }

    setCover() {
        this.cover = new Cover({
            $content: this.$content,
        });
    }
}

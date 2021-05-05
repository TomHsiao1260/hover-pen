import Cover from './Cover';
import Scene1 from './Scene1';

export default class View {
    constructor(_option) {
        this.sizes = _option.sizes;
        this.$content = document.querySelector('.content');

        this.setCover();
        this.setScene1();
    }

    setCover() {
        this.cover = new Cover({
            $content: this.$content,
        });
    }

    setScene1() {
        this.scene1 = new Scene1({
            $content: this.$content,
            sizes: this.sizes,
        });
    }
}

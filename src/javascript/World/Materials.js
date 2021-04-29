import LoadingPageMaterial from '../Materials/LoadingPage';
import ParticlesMaterial from '../Materials/Particles';
// import PenMaterial from '../Materials/Pen';

export default class Materials {
    constructor(_option) {
        this.resources = _option.resources;
        this.items = {};

        this.setLoadingPage();
    }

    // Initialize the loading page material before resources are ready
    setLoadingPage() {
        this.items.shader = {};
        this.items.shader.loadingPage = new LoadingPageMaterial();
    }

    // Other materials would be initialized afer resources are ready
    setMaterials() {
        this.items.basic = {};
        // this.items.basic.pen = new PenMaterial({ resources: this.resources });

        this.items.shader.particles = new ParticlesMaterial({ resources: this.resources });
    }
}

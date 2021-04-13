import LoadingPageMaterial from '../Materials/LoadingPage';
import ParticlesMaterial from '../Materials/Particles';

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
        this.items.shader.particles = new ParticlesMaterial({
            resources: this.resources,
        });
    }
}

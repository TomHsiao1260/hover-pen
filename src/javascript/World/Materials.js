import LoadingPageMaterial from '../Materials/LoadingPage';
import ParticlesMaterial from '../Materials/Particles';

export default class Materials {
    constructor(_option) {
        this.resources = _option.resources;
        this.items = {};

        this.setLoadingPage();
    }

    setLoadingPage() {
        this.items.shader = {};
        this.items.shader.loadingPage = new LoadingPageMaterial();
    }

    setMaterials() {
        this.items.shader.particles = new ParticlesMaterial();
    }
}

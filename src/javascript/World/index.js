import * as THREE from 'three';

import LoadingPage from './LoadingPage';
import Particles from './Particles';
import Materials from './Materials';
import Role from './Role';

export default class World {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;
        this.materials = new Materials({ resources: this.resources });

        this.setLoadingPage();
        this.setStartingScreen();
    }

    setLoadingPage() {
        this.loadingPage = new LoadingPage({ materials: this.materials });
        this.container.add(this.loadingPage.container);
    }

    setStartingScreen() {
        this.resources.on('progess', (percent) => this.loadingPage.setProgress(percent));
        this.resources.on('ready', () => this.start());
    }

    start() {
        this.loadingPage.setFinish();
        this.materials.setMaterials();

        this.setRole();
        // this.setParticles();
    }

    setRole() {
        this.role = new Role({
            resources: this.resources,
            time: this.time,
        });

        this.container.add(this.role.container);
    }

    setParticles() {
        this.particles = new Particles({
            time: this.time,
            materials: this.materials,
        });

        this.container.add(this.particles.container);
    }
}
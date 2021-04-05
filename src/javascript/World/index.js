import * as THREE from 'three';

import LoadingPage from './LoadingPage';
import Controls from './Controls';
import Labels from './Labels';
import Particles from './Particles';
import Materials from './Materials';
import Role from './Role';

export default class World {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;
        this.debug = _option.debug;
        this.light = _option.light;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;
        this.materials = new Materials({ resources: this.resources });

        this.setLoadingPage();
        this.setControls();
        this.setStartingScreen();
    }

    setLoadingPage() {
        this.loadingPage = new LoadingPage({ materials: this.materials });
        this.container.add(this.loadingPage.container);
    }

    setControls() {
        this.controls = new Controls({
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
        });
    }

    setStartingScreen() {
        this.resources.on('progess', (percent) => LoadingPage.setProgress(percent));
        this.resources.on('ready', () => this.start());
    }

    start() {
        this.loadingPage.setFinish();
        this.materials.setMaterials();

        this.setRole();
        this.setLabels();
        this.setParticles();
    }

    setRole() {
        this.role = new Role({
            resources: this.resources,
            time: this.time,
            debug: this.debug,
            controls: this.controls,
            light: this.light,
        });

        this.container.add(this.role.container);
    }

    setLabels() {
        this.labels = new Labels({
            role: this.role,
            time: this.time,
            debug: this.debug,
            sizes: this.sizes,
            camera: this.camera,
        });

        this.container.add(this.labels.container);
    }

    setParticles() {
        this.particles = new Particles({
            time: this.time,
            role: this.role,
            controls: this.controls,
            camera: this.camera,
            debug: this.debug,
            materials: this.materials,
        });

        this.container.add(this.particles.container);
    }
}

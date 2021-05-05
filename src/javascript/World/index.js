import * as THREE from 'three';

import LoadingPage from './LoadingPage';
import Transitions from './Transitions';
import Controls from './Controls';
import Labels from './Labels';
import Particles from './Particles';
import Materials from './Materials';
import Role from './Role';
import Scene1 from './Scene1';

export default class World {
    constructor(_option) {
        this.$canvas = _option.$canvas;
        this.resources = _option.resources;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;
        this.debug = _option.debug;
        this.light = _option.light;
        this.timeline = _option.timeline;
        this.renderer = _option.renderer;
        this.view = _option.view;

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
        this.resources.on('progess', (percent) => LoadingPage.setProgress(percent));
        this.resources.on('ready', () => this.start());
    }

    async start() {
        this.loadingPage.setFinish();
        this.materials.setMaterials();

        this.setControls();
        this.setRole();
        this.setLabels();
        this.setParticles();
        this.setScene1();
        this.setTransition();

        // pen only scene
        await this.transitions.penFocus();
        await new Promise((resolve) => { this.view.cover.$next.onclick = resolve; });

        // the first scene
        await this.transitions.removePenCallbacks();
        await this.transitions.firstSceneFocus();
        await new Promise((resolve) => { this.view.cover.$next.onclick = resolve; });
    }

    setControls() {
        this.controls = new Controls({
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
        });
    }

    setRole() {
        this.role = new Role({
            $canvas: this.$canvas,
            resources: this.resources,
            time: this.time,
            debug: this.debug,
            controls: this.controls,
            light: this.light,
            timeline: this.timeline,
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
            controls: this.controls,
        });

        this.container.add(this.labels.container);
    }

    setParticles() {
        this.particles = new Particles({
            time: this.time,
            sizes: this.sizes,
            role: this.role,
            controls: this.controls,
            camera: this.camera,
            debug: this.debug,
            materials: this.materials,
            timeline: this.timeline,
        });

        this.container.add(this.particles.container);
    }

    setScene1() {
        this.scene1 = new Scene1({
            time: this.time,
            sizes: this.sizes,
            debug: this.debug,
            camera: this.camera,
            timeline: this.timeline,
            resources: this.resources,
            materials: this.materials,
        });

        this.container.add(this.scene1.container);
    }

    setTransition() {
        this.transitions = new Transitions({
            time: this.time,
            camera: this.camera,
            particles: this.particles,
            role: this.role,
            scene1: this.scene1,
            labels: this.labels,
            light: this.light,
            timeline: this.timeline,
            renderer: this.renderer,
            view: this.view,
        });
    }
}

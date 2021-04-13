import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';

import Time from './Utils/Time';
import Sizes from './Utils/Sizes';
import Resources from './Resources';

import Camera from './Camera';
import Light from './Light';
import World from './World';

export default class Application {
    constructor(_option) {
        this.$canvas = _option.$canvas;
        // use only one timeline to handle all animations related to GSAP
        this.timeline = gsap.timeline();

        this.time = new Time();
        this.sizes = new Sizes();
        this.resources = new Resources();

        this.setConfig();
        this.setDebug();
        this.setRenderer();
        this.setCamera();
        this.setLight();
        this.setWorld();
    }

    setConfig() {
        this.config = {};
        this.config.debug = window.location.hash === '#debug';
    }

    setDebug() {
        if (this.config.debug) {
            const width = this.sizes.width > 768 ? 420 : 210;
            this.debug = new dat.GUI({ width });
        }
    }

    setRenderer() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
        });

        const { width, height } = this.sizes.viewport;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 3;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.sizes.on('resize', () => {
            const { width, height } = this.sizes.viewport;
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    setCamera() {
        this.camera = new Camera({
            resources: this.resources,
            time: this.time,
            sizes: this.sizes,
            renderer: this.renderer,
            canvas: this.$canvas,
            debug: this.debug,
            timeline: this.timeline,
        });

        this.scene.add(this.camera.container);
        this.time.on('tick', () => this.renderer.render(this.scene, this.camera.instance));
    }

    setLight() {
        this.light = new Light({
            debug: this.debug,
            timeline: this.timeline,
        });
        this.scene.add(this.light.container);
    }

    setWorld() {
        this.world = new World({
            resources: this.resources,
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
            debug: this.debug,
            light: this.light,
            timeline: this.timeline,
        });

        this.scene.add(this.world.container);
    }
}

import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.renderer = _option.renderer;
        this.canvas = _option.canvas;
        this.debug = _option.debug;
        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('camera');
            // this.debugFolder.open();
        }

        this.setInstance();
        this.setTransition();
        this.setControls();
    }

    setInstance() {
        const { width, height } = this.sizes.viewport;
        this.instance = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        // this.instance.position.set(1.1, 3.3, 11);
        this.instance.position.set(-2.0, -1.2, -2.2);
        this.container.add(this.instance);

        if (this.debug) {
            /* eslint-disable newline-per-chained-call */
            this.debugFolder.add(this.instance.position, 'x').min(-20).max(20).step(0.1).name('positionX');
            this.debugFolder.add(this.instance.position, 'y').min(-20).max(20).step(0.1).name('positionY');
            this.debugFolder.add(this.instance.position, 'z').min(-20).max(20).step(0.1).name('positionZ');
            /* eslint-disable newline-per-chained-call */
        }

        this.sizes.on('resize', () => {
            const { width, height } = this.sizes.viewport;
            this.instance.aspect = width / height;
            this.instance.updateProjectionMatrix();
        });
    }

    setTransition() {
        this.timeline = gsap.timeline();

        this.path = [];
        this.path.push({ duration: 10, point: new THREE.Vector3(4.0, 13.0, 10.0) });
        this.path.push({ duration: 5, point: new THREE.Vector3(1.1, 3.3, 11.0) });

        this.resources.on('ready', async () => {
            await new Promise((resolve) => setTimeout(resolve, 5000));

            this.path.forEach(({ duration, point }) => {
                const { x, y, z } = point;
                // eslint-disable-next-line object-curly-newline
                this.timeline.to(this.instance.position, { duration, x, y, z });
            });
        });
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.enableDamping = true;

        this.time.on('tick', () => this.controls.update());
    }
}

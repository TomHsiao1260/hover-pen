import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor(_option) {
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.renderer = _option.renderer;
        this.canvas = _option.canvas;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.setInstance();
        this.setControls();
    }

    setInstance() {
        const { width, height } = this.sizes.viewport;
        this.instance = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        this.instance.position.set(0, 5, 13);
        this.instance.lookAt(new THREE.Vector3());
        this.container.add(this.instance);

        this.sizes.on('resize', () => {
            const { width, height } = this.sizes.viewport;
            this.instance.aspect = width / height;
            this.instance.updateProjectionMatrix();
        });
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.enableDamping = true;

        this.time.on('tick', () => this.controls.update() );
    }
}
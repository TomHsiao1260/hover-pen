import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.renderer = _option.renderer;
        this.canvas = _option.canvas;
        this.debug = _option.debug;
        this.timeline = _option.timeline;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('camera');
            // this.debugFolder.open();
        }

        this.setRWD();
        this.setInstance();
        this.setControls();
    }

    setRWD() {
        switch (this.sizes.width > 768) {
            case true: this.scale = 1.0; break;
            case false: this.scale = 1.6; break;
            default: break;
        }
    }

    setInstance() {
        const { width, height } = this.sizes.viewport;
        this.instance = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
        this.instance.position.set(-2.0, -1.2, -2.2);
        // this.instance.position.set(1.1, 3.3, 11.0);
        this.instance.position.multiplyScalar(this.scale);
        this.container.add(this.instance);

        if (this.debug) {
            this.debugFolder.add(this.instance.position, 'x').min(-20).max(20).step(0.1).name('positionX');
            this.debugFolder.add(this.instance.position, 'y').min(-20).max(20).step(0.1).name('positionY');
            this.debugFolder.add(this.instance.position, 'z').min(-20).max(20).step(0.1).name('positionZ');
        }

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
        this.controls.enabled = false;

        this.time.on('tick', () => this.controls.update());
    }

    // Setting camera motion with GSAP
    setPenTransition() {
        this.path = [];
        this.path.push({ delay: 5,
                         duration: 10.0,
                         point: new THREE.Vector3(6.6, 12, 5.0),
                         label: 'cameraStart',
        });
        this.path.push({ delay: 0,
                         duration: 5.0,
                         point: new THREE.Vector3(1.1, 3.3, 11.0),
                         label: 'cameraLast',
        });

        this.path.forEach(({ delay, duration, point, label }) => {
            const { x, y, z } = point.multiplyScalar(this.scale);
            this.timeline.to(this.instance.position, { delay, duration, x, y, z }, label);
        });
    }
}

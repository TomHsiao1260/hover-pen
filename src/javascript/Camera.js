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
        this.instance.position.multiplyScalar(this.scale);
        this.container.add(this.instance);

        if (this.debug) {
            this.debugFolder.add(this.instance.position, 'x').min(-60).max(60).step(0.1).name('positionX');
            this.debugFolder.add(this.instance.position, 'y').min(-60).max(60).step(0.1).name('positionY');
            this.debugFolder.add(this.instance.position, 'z').min(-60).max(60).step(0.1).name('positionZ');
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

        this.time.on('tick', () => this.controls.update());
        if (this.debug) {
            this.debugFolder.add(this.controls.target, 'x').min(-60).max(60).step(0.1).name('targetX');
            this.debugFolder.add(this.controls.target, 'y').min(-60).max(60).step(0.1).name('targetY');
            this.debugFolder.add(this.controls.target, 'z').min(-60).max(60).step(0.1).name('targetZ');
        }
    }

    // Setting camera motion with GSAP
    setPenTransition() {
        const target = this.instance.position;

        this.path = [];
        this.path.push({ target,
                         delay: 5,
                         duration: 10.0,
                         x: 6.6 * this.scale,
                         y: 12.0 * this.scale,
                         z: 5.0 * this.scale,
                         label: 'cameraUp',
        });
        this.path.push({ target,
                         delay: 0,
                         duration: 5.0,
                         x: 1.1 * this.scale,
                         y: 3.3 * this.scale,
                         z: 11.0 * this.scale,
                         label: 'cameraDown',
        });

        this.path.forEach((obj) => {
            const { target, label, ...props } = obj;
            this.timeline.to(target, props, label);
        });
    }

    setFirstSceneTransition() {
        const targetA = this.controls.target;
        const targetB = this.instance.position;

        const vectorA = new THREE.Vector3(-19, -3.4, -1.2);
        const vectorB = new THREE.Vector3(-4.2, 22, 35);

        this.path = [];
        this.path.push({ delay: 0,
                         duration: 3.0,
                         xA: vectorA.x,
                         yA: vectorA.y,
                         zA: vectorA.z,
                         xB: (vectorB.x - vectorA.x) * this.scale + vectorA.x,
                         yB: (vectorB.y - vectorA.y) * this.scale + vectorA.y,
                         zB: (vectorB.z - vectorA.z) * this.scale + vectorA.z,
                         ease: 'Power1.easeOut',
                         label: 'cameraToScene',
                         addTo: 'sceneStart',
        });

        this.path.forEach((obj) => {
            const { label, addTo, ...props } = obj;
            const { xA, yA, zA, xB, yB, zB, ...common } = props;
            this.timeline.addLabel(label, addTo);
            this.timeline.to(targetA, { x: xA, y: yA, z: zA, ...common }, label);
            this.timeline.to(targetB, { x: xB, y: yB, z: zB, ...common }, label);
        });
    }
}

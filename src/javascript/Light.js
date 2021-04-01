import * as THREE from 'three';

export default class Light {
    constructor(_option) {
        this.debug = _option.debug;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('light');
            this.debugFolder.open();
        }

        this.setInstance();
    }

    setInstance() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        this.pointLight = new THREE.PointLight(0xffffff, 20);

        this.directionalLight.position.set(-9, 2, -5.3);
        this.pointLight.position.set(7.5, -4, 0.1);

        this.container.add(this.ambientLight);
        this.container.add(this.directionalLight);
        this.container.add(this.pointLight);

        if (this.debug) {
            /* eslint-disable newline-per-chained-call */
            this.debugFolder.add(this.directionalLight.position, 'x').min(-10).max(10).step(0.1).name('directX');
            this.debugFolder.add(this.directionalLight.position, 'y').min(-10).max(10).step(0.1).name('directY');
            this.debugFolder.add(this.directionalLight.position, 'z').min(-10).max(10).step(0.1).name('directZ');
            this.debugFolder.add(this.pointLight.position, 'x').min(-10).max(10).step(0.1).name('pointX');
            this.debugFolder.add(this.pointLight.position, 'y').min(-10).max(10).step(0.1).name('pointY');
            this.debugFolder.add(this.pointLight.position, 'z').min(-10).max(10).step(0.1).name('pointZ');
            this.debugFolder.add(this.ambientLight, 'intensity').min(0).max(10).step(0.001).name('ambientIntensity');
            this.debugFolder.add(this.pointLight, 'intensity').min(0).max(20).step(0.001).name('pointIntensity');
            this.debugFolder.add(this.directionalLight, 'intensity').min(0).max(20).step(0.001).name('directionalIntensity');
            /* eslint-disable newline-per-chained-call */
        }
    }
}

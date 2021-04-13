import * as THREE from 'three';

export default class Light {
    constructor(_option) {
        this.debug = _option.debug;
        this.timeline = _option.timeline;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('light');
            // this.debugFolder.open();
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
            this.debugFolder.add(this.directionalLight.position, 'x').min(-10).max(10).step(0.1).name('directX');
            this.debugFolder.add(this.directionalLight.position, 'y').min(-10).max(10).step(0.1).name('directY');
            this.debugFolder.add(this.directionalLight.position, 'z').min(-10).max(10).step(0.1).name('directZ');
            this.debugFolder.add(this.pointLight.position, 'x').min(-10).max(10).step(0.1).name('pointX');
            this.debugFolder.add(this.pointLight.position, 'y').min(-10).max(10).step(0.1).name('pointY');
            this.debugFolder.add(this.pointLight.position, 'z').min(-10).max(10).step(0.1).name('pointZ');
            this.debugFolder.add(this.ambientLight, 'intensity').min(0).max(10).step(0.001).name('ambientIntensity');
            this.debugFolder.add(this.pointLight, 'intensity').min(0).max(20).step(0.001).name('pointIntensity');
            this.debugFolder.add(this.directionalLight, 'intensity').min(0).max(20).step(0.001).name('directionalIntensity');
        }
    }

    // light transition animation using GSAP
    setTransition() {
        const targetA = this.directionalLight;
        const targetB = this.pointLight;

        this.path = [];
        this.path.push({ delay: 0,
                         duration: 5.0,
                         y: -10,
                         intensityA: 0,
                         intensityB: 5,
                         ease: 'Power1.easeOut',
                         label: 'lightStart',
                         // at the same time as 'cameraLast'
                         addTo: 'cameraLast',
        });
        this.path.push({ delay: 1.0,
                         duration: 0.3,
                         y: targetA.position.y,
                         intensityA: targetA.intensity,
                         intensityB: targetB.intensity,
                         ease: 'Power1.easeOut',
                         label: 'lightEnd',
                         // at the same time as 'particle2'
                         addTo: 'particle2',
        });

        this.path.forEach(({ y, intensityA, intensityB, delay, duration, ease, label, addTo }) => {
            this.timeline.addLabel(label, addTo);
            this.timeline.to(targetA.position, { y, delay, duration, ease }, label);
            this.timeline.to(targetA, { intensity: intensityA, delay, duration, ease }, label);
            this.timeline.to(targetB, { intensity: intensityB, delay, duration, ease }, label);
        });
    }
}

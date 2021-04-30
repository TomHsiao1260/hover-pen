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
    setPenTransition() {
        const targetA = this.pointLight;
        const targetB = this.directionalLight;
        const targetC = this.directionalLight.position;

        this.path = [];
        this.path.push({ delay: 0,
                         duration: 5.0,
                         intensityA: 5,
                         intensityB: 0,
                         yC: -10,
                         ease: 'Power1.easeOut',
                         label: 'lightDark',
                         addTo: 'cameraDown',
        });
        this.path.push({ delay: 1.0,
                         duration: 0.3,
                         intensityA: targetA.intensity,
                         intensityB: targetB.intensity,
                         yC: targetC.y,
                         ease: 'Power1.easeOut',
                         label: 'lightNormal',
                         addTo: 'particleBurst',
        });

        this.path.forEach((obj) => {
            const { label, addTo, ...props } = obj;
            const { intensityA, intensityB, yC, ...common } = props;

            this.timeline.addLabel(label, addTo);
            this.timeline.to(targetA, { intensity: intensityA, ...common }, label);
            this.timeline.to(targetB, { intensity: intensityB, ...common }, label);
            this.timeline.to(targetC, { y: yC, ...common }, label);
        });
    }

    setFirstSceneTransition() {
        const targetA = this.pointLight;
        const targetB = this.directionalLight;
        const targetC = this.directionalLight.position;

        this.path = [];
        this.path.push({ delay: 0,
                         duration: 1.0,
                         intensityA: 5,
                         intensityB: 0,
                         yC: -10,
                         ease: 'Power1.easeOut',
                         label: 'lightDark',
                         addTo: 'sceneStart',
        });
        this.path.push({ delay: 1.0,
                         duration: 5,
                         intensityA: targetA.intensity,
                         intensityB: targetB.intensity,
                         yC: targetC.y,
                         ease: 'Power1.easeOut',
                         label: 'lightNormal',
                         addTo: '>',
        });

        this.path.forEach((obj) => {
            const { label, addTo, ...props } = obj;
            const { intensityA, intensityB, yC, ...common } = props;

            this.timeline.addLabel(label, addTo);
            this.timeline.to(targetA, { intensity: intensityA, ...common }, label);
            this.timeline.to(targetB, { intensity: intensityB, ...common }, label);
            this.timeline.to(targetC, { y: yC, ...common }, label);
        });
    }
}

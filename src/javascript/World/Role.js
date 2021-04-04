import * as THREE from 'three';

export default class Role {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;
        this.debug = _option.debug;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('role');
            // this.debugFolder.open();
        }

        this.setRole();
        this.setTraverse();
        this.setAnimation();
    }

    setRole() {
        this.instance = this.resources.items.pen.scene;
        this.parameters = {};
        this.parameters.rotate = 1.2;
        this.parameters.tilt = 0.001;
        this.parameters.speed = 0.0005;

        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.container.add(this.instance);
    }

    setTraverse() {
        this.instance.traverse((child) => {
            switch (child.name) {
                case 'pen': this.pen = child; break;
                case 'penPeak': this.penPeak = child; break;
                case 'penBody': this.penBody = child; break;
                default: break;
            }

            if (child.name === 'Torus') {
                // eslint-disable-next-line no-param-reassign
                // child.visible = false;
            }

            if (this.debug) {
                // eslint-disable-next-line newline-per-chained-call
                this.debugFolder.add(child, 'visible').name(child.name);
            }
        });

        this.instancePen = new THREE.Object3D();
        this.instancePen.name = 'pen instance';
        this.instancePen.rotation.x = Math.PI * this.parameters.tilt;

        while (this.pen.children.length) {
            this.instancePen.add(this.pen.children[0]);
        }

        this.pen.add(this.instancePen);

        if (this.debug) {
            const axes1 = new THREE.AxesHelper();
            const axes2 = new THREE.AxesHelper();
            this.pen.add(axes1);
            this.instancePen.add(axes2);

            /* eslint-disable newline-per-chained-call */
            this.debugFolder.add(this.parameters, 'speed').min(0).max(0.01).step(0.00001).name('speed');
            this.debugFolder.add(this.parameters, 'rotate').min(0).max(2).step(0.01).name('rotate').onChange(() => this.setParameters());
            this.debugFolder.add(this.parameters, 'tilt').min(0).max(0.2).step(0.001).name('tilt').onChange(() => this.setParameters());
            /* eslint-disable newline-per-chained-call */
        }
    }

    setAnimation() {
        this.time.on('tick', () => {
            const theta = this.time.delta * this.parameters.speed;
            this.pen.rotateOnAxis(new THREE.Vector3(0, 1, 0), theta);
        });
    }

    setParameters() {
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.instancePen.rotation.x = Math.PI * this.parameters.tilt;
    }
}

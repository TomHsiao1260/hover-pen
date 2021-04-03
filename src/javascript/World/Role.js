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

        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.rotation.y = Math.PI * 1.2;
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
        this.instancePen.rotation.x = Math.PI / 20;

        while (this.pen.children.length) {
            this.instancePen.add(this.pen.children[0]);
        }

        this.pen.add(this.instancePen);

        if (this.debug) {
            const axes1 = new THREE.AxesHelper();
            const axes2 = new THREE.AxesHelper();
            this.pen.add(axes1);
            this.instancePen.add(axes2);
        }
    }

    setAnimation() {
        this.time.on('tick', () => {
            this.pen.rotateOnAxis(new THREE.Vector3(0, 1, 0), this.time.delta * 0.001);
            // pen.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.01);
        });
    }
}

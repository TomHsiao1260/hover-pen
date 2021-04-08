import * as THREE from 'three';

export default class Labels {
    constructor(_option) {
        this.role = _option.role;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;
        this.debug = _option.debug;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('label');
            // this.debugFolder.open();
        }

        this.setDOM();
        this.setLabels();
    }

    setDOM() {
        this.labels = [];
        this.label1 = {};
        this.label2 = {};
        this.labels.push(this.label1);
        this.labels.push(this.label2);

        this.label1.container = document.createElement('DIV');
        this.label2.container = document.createElement('DIV');
        this.label1.container.className = 'container';
        this.label2.container.className = 'container';

        this.label1.point = document.createElement('DIV');
        this.label2.point = document.createElement('DIV');
        this.label1.point.className = 'point point-1 left';
        this.label2.point.className = 'point point-2 right';
        this.label1.point.innerText = '23.5 degree tilt';
        this.label2.point.innerText = 'only 16g pen weight';
        // eslint-disable-next-line object-curly-newline
        this.label1.config = { shiftX: 40, shiftY: 0, k: 0.001, phase: 0.0 * Math.PI, amp: 5 };
        // eslint-disable-next-line object-curly-newline
        this.label2.config = { shiftX: -167, shiftY: 35, k: 0.001, phase: 0.5 * Math.PI, amp: 5 };

        this.points = document.querySelector('.points');
        this.points.appendChild(this.label1.container);
        this.points.appendChild(this.label2.container);
        this.label1.container.appendChild(this.label1.point);
        this.label2.container.appendChild(this.label2.point);

        if (this.debug) {
            this.role.label1.add(new THREE.AxesHelper(0.5));
            this.role.label2.add(new THREE.AxesHelper(0.5));

            this.debugFolder.add(this.label1.config, 'shiftX').min(-300).max(300).step(1).name('label1 shiftX');
            this.debugFolder.add(this.label1.config, 'shiftY').min(-300).max(300).step(1).name('label1 shiftY');
            this.debugFolder.add(this.label2.config, 'shiftX').min(-300).max(300).step(1).name('label2 shiftX');
            this.debugFolder.add(this.label2.config, 'shiftY').min(-300).max(300).step(1).name('label2 shiftY');
        }
    }

    async setLabels() {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        this.label1.mesh = this.role.label1;
        this.label2.mesh = this.role.label2;
        this.label1.position = this.label1.mesh.position.clone();
        this.label2.position = this.label2.mesh.position.clone();

        this.labels.forEach((value) => {
            const label = value;
            while (label.mesh.parent !== null) {
                const matrix = label.mesh.parent.matrix.clone();
                label.position = label.position.applyMatrix4(matrix);
                label.mesh = label.mesh.parent;
            }
        });

        this.time.on('tick', () => {
            this.labels.forEach((value) => {
                const label = value;
                const screenPosition = label.position.clone();
                screenPosition.project(this.camera.instance);

                let x = screenPosition.x * this.sizes.width * 0.5;
                let y = -screenPosition.y * this.sizes.height * 0.5;

                x += label.config.shiftX;
                y -= label.config.shiftY;

                const theta = label.config.k * this.time.elapsed + label.config.phase;
                y -= label.config.amp * Math.sin(theta);

                label.container.style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        });

        this.label1.point.classList.add('visible');
        this.label1.point.classList.add('typing');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        this.label2.point.classList.add('visible');
        this.label2.point.classList.add('typing');
    }
}

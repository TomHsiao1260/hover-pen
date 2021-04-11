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

        this.setup();
    }

    async setup() {
        await this.setDOM();
        await this.setPosition();
        await this.setAnimation();
    }

    async start() {
        await this.setDisplay();
        await this.setHidden();
    }

    setDOM() {
        this.labels = [];
        this.label1 = {};
        this.label2 = {};
        this.labels.push(this.label1);
        this.labels.push(this.label2);

        this.label1.$container = document.createElement('DIV');
        this.label2.$container = document.createElement('DIV');
        this.label1.$container.className = 'container';
        this.label2.$container.className = 'container';

        this.label1.$point = document.createElement('DIV');
        this.label2.$point = document.createElement('DIV');
        this.label1.$point.className = 'point point-1 left';
        this.label2.$point.className = 'point point-2 right';
        this.label1.$point.innerText = '23.5 degree tilt';
        this.label2.$point.innerText = 'only 16g pen weight';

        this.labels.config = { k: 0.0005, amp: 15 };
        this.label1.config = { shiftX: 28, shiftY: 17, phase: 0.0 * Math.PI };
        this.label2.config = { shiftX: -200, shiftY: 17, phase: 0.5 * Math.PI };
        if (this.sizes.width < 768) {
            this.label1.config = { shiftX: 0, shiftY: -20, phase: 0.0 * Math.PI };
            this.label2.config = { shiftX: -172, shiftY: 8, phase: 0.5 * Math.PI };
        }

        this.$points = document.querySelector('.points');
        this.$points.appendChild(this.label1.$container);
        this.$points.appendChild(this.label2.$container);
        this.label1.$container.appendChild(this.label1.$point);
        this.label2.$container.appendChild(this.label2.$point);

        if (this.debug) {
            this.role.label1.add(new THREE.AxesHelper(0.5));
            this.role.label2.add(new THREE.AxesHelper(0.5));

            this.debugFolder.add(this.labels.config, 'k').min(0).max(0.01).step(0.0001).name('labels k');
            this.debugFolder.add(this.labels.config, 'amp').min(0).max(50).step(1).name('labels ampitude');
            this.debugFolder.add(this.label1.config, 'shiftX').min(-300).max(300).step(1).name('label1 shiftX');
            this.debugFolder.add(this.label1.config, 'shiftY').min(-300).max(300).step(1).name('label1 shiftY');
            this.debugFolder.add(this.label1.config, 'phase').min(-4).max(4).step(0.1).name('label1 phase');
            this.debugFolder.add(this.label2.config, 'shiftX').min(-300).max(300).step(1).name('label2 shiftX');
            this.debugFolder.add(this.label2.config, 'shiftY').min(-300).max(300).step(1).name('label2 shiftY');
            this.debugFolder.add(this.label2.config, 'phase').min(-4).max(4).step(0.1).name('label2 phase');
        }
    }

    async setPosition() {
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
    }

    setAnimation() {
        this.time.on('tick', () => {
            this.labels.forEach((value) => {
                const label = value;
                label.screenPosition = label.position.clone();
                label.screenPosition.project(this.camera.instance);

                const theta = this.labels.config.k * this.time.elapsed + label.config.phase;
                const shift = this.labels.config.amp * Math.sin(theta);
                let { x, y } = label.screenPosition;
                x *= this.sizes.width * 0.5;
                y *= -this.sizes.height * 0.5;
                x += label.config.shiftX;
                y -= label.config.shiftY + shift;

                label.$container.style.transform = `translateX(${x}px) translateY(${y}px)`;
            });
        });
    }

    async setDisplay() {
        this.label1.$point.classList.add('visible');
        this.label1.$point.classList.add('typing');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        this.label2.$point.classList.add('visible');
        this.label2.$point.classList.add('typing');
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setHidden() {
        const raycaster = new THREE.Raycaster();
        const obstacles = [];
        obstacles.push(this.role.penBox);
        obstacles.push(this.role.ringBox);
        obstacles.push(this.role.base1Box);
        obstacles.push(this.role.base2Box);

        this.time.on('tick', () => {
            this.labels.forEach((label) => {
                raycaster.setFromCamera(label.screenPosition, this.camera.instance);
                const intersects = raycaster.intersectObjects(obstacles);

                if (intersects.length === 0) {
                    label.$point.classList.add('visible');
                } else {
                    const obstacleDistance = intersects[0].distance;
                    const pointDistance = label.position.distanceTo(this.camera.instance.position);

                    if (obstacleDistance < pointDistance) {
                        label.$point.classList.remove('visible');
                    } else {
                        label.$point.classList.add('visible');
                    }
                }
            });
        });
    }
}

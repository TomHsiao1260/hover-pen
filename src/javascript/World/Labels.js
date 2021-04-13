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
        await this.setData();
        await this.setDOM();
        await this.setPosition();
        await this.setAnimation();
    }

    async start() {
        await this.setDisplay();
        await this.setHidden();
    }

    setData() {
        this.labels = [];
        this.label1 = {};
        this.label2 = {};
        this.labels.push(this.label1);
        this.labels.push(this.label2);

        this.label1.name = 'label1';
        this.label1.className = 'point point-1 left';
        this.label1.innerText = '23.5 degree tilt';
        this.label1.config = { shiftX: 28, shiftY: 17, phase: 0.0 * Math.PI };
        this.label1.wait = 1500;

        this.label2.name = 'label2';
        this.label2.className = 'point point-2 right';
        this.label2.innerText = 'only 16g pen weight';
        this.label2.config = { shiftX: -200, shiftY: 17, phase: 0.5 * Math.PI };
        this.label2.wait = 2000;

        this.labels.config = { k: 0.0005, amp: 15 };
        // labels positioning parameters (on mobile)
        if (this.sizes.width < 768) {
            this.labels.config = { k: 0.0005, amp: 10 };
            this.label1.config = { shiftX: 0, shiftY: -20, phase: 0.0 * Math.PI };
            this.label2.config = { shiftX: -172, shiftY: 8, phase: 0.5 * Math.PI };
        }
    }

    // labels DOM
    setDOM() {
        this.$points = document.querySelector('.points');

        this.labels.forEach((value) => {
            const label = value;

            label.$container = document.createElement('DIV');
            label.$container.className = 'container';
            label.$point = document.createElement('DIV');
            label.$point.className = label.className;
            label.$point.innerText = label.innerText;

            label.$container.appendChild(label.$point);
            this.$points.appendChild(label.$container);

            if (this.debug) {
                this.role[label.name].add(new THREE.AxesHelper(0.5));
                this.debugFolder.add(label.config, 'shiftX').min(-300).max(300).step(1).name(`${label.name} shiftX`);
                this.debugFolder.add(label.config, 'shiftY').min(-300).max(300).step(1).name(`${label.name} shiftY`);
                this.debugFolder.add(label.config, 'phase').min(-4).max(4).step(0.1).name(`${label.name} phase`);
            }
        });

        if (this.debug) {
            this.debugFolder.add(this.labels.config, 'k').min(0).max(0.01).step(0.0001).name('labels k');
            this.debugFolder.add(this.labels.config, 'amp').min(0).max(50).step(1).name('labels ampitude');
        }
    }

    // calculate global position for each label (in Scene coordinate)
    async setPosition() {
        // wait 1 second to make sure all transformation matrices are ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.labels.forEach((value) => {
            const label = value;
            label.mesh = this.role[label.name];
            label.position = label.mesh.position.clone();

            // apply all matrices for each parent by traversing
            while (label.mesh.parent !== null) {
                const matrix = label.mesh.parent.matrix.clone();
                label.position = label.position.applyMatrix4(matrix);
                label.mesh = label.mesh.parent;
            }
        });
    }

    // labels animation
    setAnimation() {
        this.time.on('tick', () => {
            this.labels.forEach((value) => {
                // dynamically project each label position to the 2D screen coordinate (-1 ~ +1)
                const label = value;
                label.screenPosition = label.position.clone();
                label.screenPosition.project(this.camera.instance);

                // resizing and animating (up & down)
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

    // display each label with typing effect
    async setDisplay() {
        await this.labels.reduce(async (promise, value) => {
            await promise;

            const label = value;
            label.$point.classList.add('visible');
            label.$point.classList.add('typing');

            return new Promise((resolve) => setTimeout(resolve, label.wait));
        }, Promise.resolve());
    }

    // hide the label if it's behind the meshes
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

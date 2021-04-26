import * as THREE from 'three';

export default class Labels {
    constructor(_option) {
        this.role = _option.role;
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.camera = _option.camera;
        this.controls = _option.controls;
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
    }

    async start() {
        await this.setAnimation();
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
        this.label1.config = { shiftX: 28, shiftY: 17 };
        this.label1.wait = 1500;

        this.label2.name = 'label2';
        this.label2.className = 'point point-2 right';
        this.label2.innerText = 'only 16g pen weight';
        this.label2.config = { shiftX: -200, shiftY: 17 };
        this.label2.wait = 2000;

        // labels positioning parameters (on mobile)
        if (this.sizes.width < 768) {
            this.label1.config = { shiftX: 0, shiftY: -20 };
            this.label2.config = { shiftX: -172, shiftY: 8 };
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
            }
        });
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

    // dynamically project each label on 2D screen
    setAnimation() {
        this.setProjection();
        this.time.on('tick', () => {
            if (this.controls.mouse.down) this.setProjection();
        });
    }

    setProjection() {
        this.labels.forEach((value) => {
            // dynamically project each label position to the 2D screen coordinate (-1 ~ +1)
            const label = value;
            label.screenPosition = label.position.clone();
            label.screenPosition.project(this.camera.instance);

            let { x, y } = label.screenPosition;
            x *= this.sizes.width * 0.5;
            y *= -this.sizes.height * 0.5;
            x += label.config.shiftX;
            y -= label.config.shiftY;

            // update each label position
            label.$container.style.transform = `translateX(${x}px) translateY(${y}px)`;
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
                // hide labels if the pen is spinning
                if (this.role.parameters.spinning) {
                    label.$point.classList.remove('visible');
                    return;
                }
                // use Raycaster to determine whether the label is behind the mesh
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

import * as THREE from 'three';

export default class Particles {
    constructor(_option) {
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.controls = _option.controls;
        this.camera = _option.camera;
        this.role = _option.role;
        this.debug = _option.debug;
        this.timeline = _option.timeline;
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;
        this.callbacks = {};

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('particles');
            // this.debugFolder.open();
        }

        this.setGeometry();
        this.setParticles();
        this.setColors();
    }

    setGeometry() {
        this.parameters = {};
        this.parameters.counts = 200;
        this.parameters.speed = 0.1;
        this.parameters.centerSpeed = 0.005;

        this.vertexPosition = new Float32Array(this.parameters.counts * 3);
        this.vertexRandom = new Float32Array(this.parameters.counts * 3);
        this.vertexColor = new Float32Array(this.parameters.counts * 3);
        this.vertexBlink = new Float32Array(this.parameters.counts * 1);

        this.vertexPosition.forEach((value, i) => { this.vertexPosition[i] = 0; });
        this.vertexRandom.forEach((value, i) => { this.vertexRandom[i] = Math.random(); });
        this.vertexBlink.forEach((value, i) => { this.vertexBlink[i] = Math.random(); });
        this.vertexColor.forEach((value, i) => {
            switch (i % 3) {
                case 0: this.vertexColor[i] = Math.random() * 0.5; break;
                case 1: this.vertexColor[i] = Math.random() * 0.5; break;
                case 2: this.vertexColor[i] = Math.random() * 0.5 + 0.5; break;
                default: break;
            }
        });

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertexPosition, 3));
        this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(this.vertexRandom, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.vertexColor, 3));
        this.geometry.setAttribute('aBlink', new THREE.BufferAttribute(this.vertexBlink, 1));
    }

    setParticles() {
        this.material = this.materials.items.shader.particles;
        this.instance = new THREE.Points(this.geometry, this.material);
        this.container.add(this.instance);
        this.instance.renderOrder = 1;

        this.parameters.uWidth = this.material.uniforms.uWidth.value;
        this.parameters.uSize = this.material.uniforms.uSize.value;

        if (this.debug) {
            this.axes = new THREE.AxesHelper();
            this.container.add(this.axes);
            this.debugFolder.add(this.axes, 'visible').name('axes');
            this.debugFolder.add(this.material.uniforms.uSize, 'value').min(1).max(300).step(1).name('uSize');
            this.debugFolder.add(this.material.uniforms.uWidth, 'value').min(1).max(100).step(1).name('uWidth');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'x').min(-0.5).max(0.5).step(0.01).name('red shift');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'y').min(-0.5).max(0.5).step(0.01).name('green shift');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'z').min(-0.5).max(0.5).step(0.01).name('blue shift');
            this.debugFolder.add(this.parameters, 'speed').min(0.001).max(0.5).step(0.0001).name('speed');
        }

        this.callbacks.drift = this.time.on('tick', () => {
            const delta = this.parameters.speed * this.time.delta / 1000;
            this.material.uniforms.uTime.value += delta;
        });
    }

    // change particles color when the pen color is changed ('colorChange' event is triggered)
    setColors() {
        this.colorIndex = 0;
        this.colors = [];
        this.colors.push({ shift: new THREE.Vector3(0.0, 0.3, 0.0) });
        this.colors.push({ shift: new THREE.Vector3(0.0, 0.0, 0.0) });

        this.callbacks.colorChange = this.time.on('colorChange', () => {
            if (!this.timeline.isActive()) {
                // change color
                const { shift } = this.colors[this.colorIndex];
                this.material.uniforms.uColorShift.value.copy(shift);
                this.colorIndex += 1;
                this.colorIndex %= this.colors.length;

                // particles expansion effect
                const target = this.material.uniforms.uWidth;
                const { value } = target;
                this.timeline.to(target, { duration: 0.3, value: 1.3 * value, ease: 'Power1.easeOut' });
                this.timeline.to(target, { duration: 1.5, value: 1.0 * value, ease: 'Power1.easeOut' });
            }
        // would execute after removing the event
        }, () => {
            const { shift } = this.colors[this.colors.length - 1];
            this.material.uniforms.uColorShift.value.copy(shift);
        });
    }

    // the particles move along the pen control by moving the mouse
    async setControls() {
        // wait 1 second to make sure all transformation matrices are ready
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // calculate global position for the pen body (in Scene coordinate)
        this.meshRef = this.role.penBody;
        this.penBodyPosition = this.meshRef.position.clone();

        // apply all matrices for each parent by traversing
        while (this.meshRef.parent !== null) {
            const matrix = this.meshRef.parent.matrix.clone();
            this.penBodyPosition = this.penBodyPosition.applyMatrix4(matrix);
            this.meshRef = this.meshRef.parent;
        }
        const modify = this.sizes.width > 768 ? 1 : 1.5;

        // mouse: +y: go up & smaller, -y: go down & larger
        this.callbacks.moveUp = this.time.on('tick', () => {
            // particles system positioning
            const factor = this.controls.mouse.y > 0 ? modify : 1;
            const target = this.penBodyPosition.clone().multiplyScalar(this.controls.mouse.y * factor);
            const movement = target.sub(this.instance.position).multiplyScalar(this.parameters.centerSpeed);
            this.instance.position.add(movement);

            // particles system resize
            const scale = this.instance.position.y > 0 ? modify : -1;
            const far = this.instance.position.length() / this.penBodyPosition.length();
            const { spinning } = this.role.parameters;
            const targetWidth = (20 - 19.999 * far / scale) * (1 + 2 * spinning);
            const diff = targetWidth - this.material.uniforms.uWidth.value;
            this.material.uniforms.uWidth.value += 0.01 * diff;
        });
    }

    // particles transition animation using GSAP
    setPenTransition() {
        const target = this.material.uniforms.uWidth;
        const { value } = target;

        this.path = [];
        this.path.push({ delay: 12,
                         duration: 0.5,
                         value: 1.80 * value,
                         ease: 'Power1.easeOut',
                         label: 'particleExpand',
                         addTo: 'cameraUp',
        });
        this.path.push({ delay: 0,
                         duration: 4.5,
                         value: 0.01 * value,
                         ease: 'Power1.easeOut',
                         label: 'particleShrink',
                         addTo: 'cameraDown',
        });
        this.path.push({ delay: 1.0,
                         duration: 0.5,
                         value: 1.50 * value,
                         ease: 'Power1.easeOut',
                         label: 'particleBurst',
                         addTo: '>',
        });
        this.path.push({ delay: 2,
                         duration: 0.5,
                         value: 1.00 * value,
                         ease: 'Power1.easeOut',
                         label: 'particleNormal',
                         addTo: '>',
        });

        this.path.forEach((obj) => {
            const { label, addTo, ...props } = obj;
            this.timeline.addLabel(label, addTo);
            this.timeline.to(target, props, label);
        });
    }

    setFirstSceneTransition() {
        const targetA = this.material.uniforms.uWidth;
        const targetB = this.material.uniforms.uSize;
        const targetC = this.parameters;
        const targetD = this.instance.position;

        const valueA = this.parameters.uWidth;
        const valueB = this.parameters.uSize;
        const valueC = this.parameters.speed;
        const valueD = new THREE.Vector3(-19, -3.4, 1.2);

        this.path = [];
        this.path.push({ delay: 0,
                         duration: 10.0,
                         ease: 'Power1.easeOut',
                         valueA: 15.0 * valueA,
                         valueB: 5.0 * valueB,
                         valueC: 0.1 * valueC,
                         xD: valueD.x,
                         yD: valueD.y,
                         zD: valueD.z,
                         label: 'particleExpand',
                         addTo: 'sceneStart',
        });

        this.path.forEach((obj) => {
            const { label, addTo, ...props } = obj;
            const { valueA, valueB, valueC, xD, yD, zD, ...common } = props;

            this.timeline.addLabel(label, addTo);
            this.timeline.to(targetA, { value: valueA, ...common }, label);
            this.timeline.to(targetB, { value: valueB, ...common }, label);
            this.timeline.to(targetC, { speed: valueC, ...common }, label);
            this.timeline.to(targetD, { x: xD, y: yD, z: zD, ...common }, label);
        });
    }
}

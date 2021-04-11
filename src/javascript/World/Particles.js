import * as THREE from 'three';
import gsap from 'gsap';

export default class Particles {
    constructor(_option) {
        this.time = _option.time;
        this.sizes = _option.sizes;
        this.controls = _option.controls;
        this.camera = _option.camera;
        this.role = _option.role;
        this.debug = _option.debug;
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

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
        this.parameters.speed = 0.01;

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

        if (this.debug) {
            this.axes = new THREE.AxesHelper();
            this.container.add(this.axes);
            this.debugFolder.add(this.axes, 'visible').name('axes');
            this.debugFolder.add(this.material.uniforms.uSize, 'value').min(1).max(300).step(1).name('uSize');
            this.debugFolder.add(this.material.uniforms.uWidth, 'value').min(1).max(100).step(1).name('uWidth');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'x').min(-0.5).max(0.5).step(0.01).name('red shift');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'y').min(-0.5).max(0.5).step(0.01).name('green shift');
            this.debugFolder.add(this.material.uniforms.uColorShift.value, 'z').min(-0.5).max(0.5).step(0.01).name('blue shift');
        }

        this.time.on('tick', () => {
            this.material.uniforms.uTime.value = this.time.elapsed / 1000;
        });
    }

    setColors() {
        this.timeline = gsap.timeline();
        this.colorIndex = 0;
        this.colors = [];
        this.colors.push({ shift: new THREE.Vector3(0.0, 0.3, 0.0) });
        this.colors.push({ shift: new THREE.Vector3(0.0, 0.0, 0.0) });

        this.time.on('colorChange', () => {
            const { shift } = this.colors[this.colorIndex];
            const { x, y, z } = shift;
            this.material.uniforms.uColorShift.value.set(x, y, z);
            this.colorIndex += 1;
            this.colorIndex %= this.colors.length;

            if (!this.timeline.isActive()) {
                const target = this.material.uniforms.uWidth;
                const { value } = target;
                this.timeline.to(target, { duration: 0.3, value: 1.3 * value, ease: 'Power1.easeOut' });
                this.timeline.to(target, { duration: 1.5, value: 1.0 * value, ease: 'Elastic.easeOut.config(1, 0.75)' });
            }
        });
    }

    async setControls() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.meshRef = this.role.penBody;
        this.penBodyPosition = this.meshRef.position.clone();

        while (this.meshRef.parent !== null) {
            const matrix = this.meshRef.parent.matrix.clone();
            this.penBodyPosition = this.penBodyPosition.applyMatrix4(matrix);
            this.meshRef = this.meshRef.parent;
        }
        const modify = this.sizes.width > 768 ? 1 : 1.5;

        this.time.on('tick', () => {
            const factor = this.controls.mouse.y > 0 ? modify : 1;
            const target = this.penBodyPosition.clone().multiplyScalar(this.controls.mouse.y * factor);
            const movement = target.sub(this.instance.position).multiplyScalar(this.parameters.speed);
            this.instance.position.add(movement);

            const scale = this.instance.position.y > 0 ? modify : -1;
            const far = this.instance.position.length() / this.penBodyPosition.length();
            this.material.uniforms.uWidth.value = 20 - 19.99 * far / scale;
        });
    }
}

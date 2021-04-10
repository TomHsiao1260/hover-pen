import * as THREE from 'three';

export default class Particles {
    constructor(_option) {
        this.time = _option.time;
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

        this.setParticles();
        this.setAnimation();
    }

    setParticles() {
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

        this.material = this.materials.items.shader.particles;
        this.instance = new THREE.Points(this.geometry, this.material);
        this.container.add(this.instance);

        if (this.debug) {
            this.axes = new THREE.AxesHelper();
            this.container.add(this.axes);
            this.debugFolder.add(this.axes, 'visible').name('axes');
        }
    }

    async setAnimation() {
        this.time.on('tick', () => {
            this.material.uniforms.uTime.value = this.time.elapsed / 1000;
        });

        await new Promise((resolve) => setTimeout(resolve, 3000));
        this.meshRef = this.role.penBody;
        this.penBodyPosition = this.meshRef.position.clone();

        while (this.meshRef.parent !== null) {
            const matrix = this.meshRef.parent.matrix.clone();
            this.penBodyPosition = this.penBodyPosition.applyMatrix4(matrix);
            this.meshRef = this.meshRef.parent;
        }

        this.time.on('tick', () => {
            const target = this.penBodyPosition.clone().multiplyScalar(this.controls.mouse.y);
            const movement = target.sub(this.instance.position).multiplyScalar(this.parameters.speed);
            this.instance.position.add(movement);

            const sign = this.instance.position.y > 0 ? 1 : -1;
            const far = this.instance.position.length() / this.penBodyPosition.length();
            this.material.uniforms.uWidth.value = 20 - 19.99 * far * sign;
        });
    }
}

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
        // this.setSurfaceDots();
        this.setAnimation();
    }

    setParticles() {
        this.parameters = {};
        this.parameters.counts = 200;

        this.vertexPosition = new Float32Array(this.parameters.counts * 3);
        this.vertexRandom = new Float32Array(this.parameters.counts * 3);
        this.vertexColor = new Float32Array(this.parameters.counts * 3);

        this.vertexPosition.forEach((value, i) => { this.vertexPosition[i] = 0; });
        this.vertexRandom.forEach((value, i) => { this.vertexRandom[i] = Math.random(); });
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

        this.material = this.materials.items.shader.particles;
        this.instance = new THREE.Points(this.geometry, this.material);
        this.container.add(this.instance);
    }

    setAnimation() {
        this.time.on('tick', () => {
            this.material.uniforms.uTime.value = this.time.elapsed / 1000;
        });
    }
}

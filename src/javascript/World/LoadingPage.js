import * as THREE from 'three';
import gsap from 'gsap';

export default class LoadingPage {
    constructor(_option) {
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.setLoadingPage();
    }

    setLoadingPage() {
        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        this.material = this.materials.items.shader.loadingPage;

        this.instance = new THREE.Mesh(this.geometry, this.material);
        this.container.add(this.instance);
    }

    static setProgress(percent) {
        console.log(`progress ${percent}/100`);
    }

    setFinish() {
        window.setTimeout(() => {
            gsap.to(this.material.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 });
        }, 500);
    }
}

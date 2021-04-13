import * as THREE from 'three';
import gsap from 'gsap';

export default class LoadingPage {
    constructor(_option) {
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.setLoadingPage();
        this.setTrademark();
    }

    // Set a black plane in front of the camera
    setLoadingPage() {
        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        this.material = this.materials.items.shader.loadingPage;

        this.instance = new THREE.Mesh(this.geometry, this.material);
        this.container.add(this.instance);
    }

    // Append the trademark DOM
    setTrademark() {
        this.trademark = document.querySelector('.trademark');

        this.markSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.markSVG.setAttributeNS(null, 'viewBox', '0 0 100 100');
        this.trademark.appendChild(this.markSVG);

        // trademark path which is based on the 100px * 100px viewbox
        this.markPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.markPath.setAttributeNS(null, 'd', 'M35 90 L10 90 L33 10 L50 50 L60 25 L90 80');
        this.markPath.setAttributeNS(null, 'fill-opacity', 0);
        this.markPath.setAttributeNS(null, 'stroke', 'white');
        this.markPath.setAttributeNS(null, 'stroke-width', 7);
        this.markPath.setAttributeNS(null, 'class', 'path');
        this.markSVG.appendChild(this.markPath);

        // title DOM
        this.title = document.createElement('div');
        this.title.setAttribute('class', 'title');
        this.title.innerText = 'SHANPO';
        this.trademark.appendChild(this.title);
    }

    static setProgress(percent) {
        console.log(`progress ${percent}/100`);
    }

    // fade out the black plane and trandemark when finished
    async setFinish() {
        await new Promise((resolve) => setTimeout(resolve, 500));
        gsap.to(this.material.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 });
        this.trademark.classList.add('fadeout');

        await new Promise((resolve) => setTimeout(resolve, 6000));
        this.trademark.style.display = 'none';
    }
}

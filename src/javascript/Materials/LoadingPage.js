import * as THREE from 'three';

import vertexShader from '../../shaders/loadingPage/vertex.glsl';
import fragmentShader from '../../shaders/loadingPage/fragment.glsl';

export default function LoadingPageMaterial() {
    const uniforms = {
        uAlpha: { value: 1.0 },
    };

    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms,
        vertexShader,
        fragmentShader,
    });

    return material;
}
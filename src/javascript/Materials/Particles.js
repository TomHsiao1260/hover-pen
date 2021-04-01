import * as THREE from 'three';

import vertexShader from '../../shaders/particles/vertex.glsl';
import fragmentShader from '../../shaders/particles/fragment.glsl';

export default function particlesMaterial() {
    const uniforms = {
        uTime: { value: 0 },
        uSize: { value: 30 * window.application.renderer.getPixelRatio() },
    };

    const material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms,
        vertexShader,
        fragmentShader,
    });

    return material;
}

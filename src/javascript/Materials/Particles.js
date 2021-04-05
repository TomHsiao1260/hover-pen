import * as THREE from 'three';

import vertexShader from '../../shaders/particles/vertex.glsl';
import fragmentShader from '../../shaders/particles/fragment.glsl';

export default function particlesMaterial(_option) {
    const spotTexture = _option.resources.items.spot;

    const uniforms = {
        uTime: { value: 0 },
        uTexture: { value: spotTexture },
        uWidth: { value: 20 },
        uSize: { value: 100 * window.application.renderer.getPixelRatio() },
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

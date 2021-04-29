import * as THREE from 'three';

export default function pen(_option) {
    const { penTexture } = _option.resources.items;

    penTexture.flipY = false;
    penTexture.encoding = THREE.sRGBEncoding;

    const material = new THREE.MeshBasicMaterial({ map: penTexture });

    return material;
}

import * as THREE from 'three';

export default function scene1(_option) {
    const { scene1Texture } = _option.resources.items;

    scene1Texture.flipY = false;
    scene1Texture.encoding = THREE.sRGBEncoding;

    const material = new THREE.MeshBasicMaterial({ map: scene1Texture });

    return material;
}

import * as THREE from 'three';
/* eslint-disable */
export default class Particles {
    constructor(_option) {
        this.time = _option.time;
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.setParticles();
        this.setAnimation();
    }

    setParticles() {
        const parameters = { 
            count: 10000,           // 顆粒數量
            radius: 10,              // 螺旋半徑
            branches: 3,             // 幾條螺旋
            randomness: 0.2,         // 多分散
            randomnessPower: 3,      // 多集中 (指數)
            insideColor: '#ff6030',  // 中心色
            outsideColor: '#1b3984', // 外圍色
        }

        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(parameters.count * 3)
        const colors = new Float32Array(parameters.count * 3)
        const scales = new Float32Array(parameters.count * 1)
        const randomness = new Float32Array(parameters.count * 3)
        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)

        // 計算每個點的 position, color
        for(let i = 0; i < parameters.count; i++) {
            const i3 = i * 3
            // 產生 0 ~ radius 的隨機半徑
            const radius = Math.random() * parameters.radius
            // 在哪一個分支上 (3 個分支則有 0,-120,+120 三種角度)
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
            // 增加亂讓粒子能分散在主曲線周圍，使用指數讓大多還是集中在曲線上
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
            // 產生最終的位置
            positions[i3    ] = Math.cos(branchAngle) * radius 
            positions[i3 + 1] = 0
            positions[i3 + 2] = Math.sin(branchAngle) * radius 
            // 設定顏色
            const mixedColor = colorInside.clone()
            mixedColor.lerp(colorOutside, radius / parameters.radius)
            colors[i3    ] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b
            // 隨機縮放粒子
            scales[i] = Math.random()
            // 亂數 (給 shader 使用)
            randomness[i3    ] = randomX
            randomness[i3 + 1] = randomY
            randomness[i3 + 2] = randomZ
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
        this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

        this.material = this.materials.items.shader.particles;

        this.instance = new THREE.Points(this.geometry, this.material);
        this.container.add( this.instance );
    }

    setAnimation() {
        this.time.on('tick', () => {
            this.material.uniforms.uTime.value = this.time.elapsed / 1000;
        })
    }
}
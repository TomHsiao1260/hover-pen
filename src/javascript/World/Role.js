import * as THREE from 'three';

export default class Role {
    constructor(_option) {
        this.resources = _option.resources;
        this.time = _option.time;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.setRole();
    }

    setRole() {
        this.instance = this.resources.items.pen.scene;

        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, -5, 0);
        this.instance.rotation.y = Math.PI * 1.2;
        this.container.add(this.instance);

        this.setTraverse();
    }

    setTraverse() {
        let pen = null;
        let penPeak = null;
        let penBody = null;

        this.instance.traverse((child) => {
            switch (child.name) {
                case 'pen': pen = child; break;
                case 'penPeak': penPeak = child; break;
                case 'penBody': penBody = child; break;
                default: break;
            }

            // if (child instanceof THREE.Mesh) {
            //     if (child.material instanceof THREE.MeshStandardMaterial) {
            //     }
            // }
        });

        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 'white' });

        const mesh1 = new THREE.Mesh(geometry, material);
        const mesh2 = new THREE.Mesh(geometry, material);

        mesh1.position.copy(penPeak.position);
        mesh2.position.copy(penBody.position);
        mesh2.rotation.x = Math.PI / 4;
        mesh1.rotation.x = Math.PI / 2;

        // const axis = penPeak.position.clone().sub(penBody.position).normalize();

        // pen.add(mesh1, mesh2)
        const axes1 = new THREE.AxesHelper();
        const axes2 = new THREE.AxesHelper();

        pen.add(axes1);
        window.application.scene.add(axes2);

        this.time.on('tick', () => {
            // pen.rotateOnAxis(axis, this.time.delta * 0.0001)
            pen.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.01);
            // pen.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.01)
        });
    }
}

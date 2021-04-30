import * as THREE from 'three';

export default class Scene1 {
    constructor(_option) {
        this.time = _option.time;
        this.camera = _option.camera;
        this.timeline = _option.timeline;
        this.debug = _option.debug;
        this.resources = _option.resources;
        this.materials = _option.materials;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;
        this.callbacks = {};

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('scene1');
            // this.debugFolder.open();
        }

        this.setup();
        this.setTraverse();
    }

    setup() {
        this.parameters = {};
        this.parameters.rotate = 1.2;

        this.instance = this.resources.items.scene1.scene;
        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.visible = false;
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.container.add(this.instance);
    }

    setTraverse() {
        if (this.debug) this.sceneFolder = this.debugFolder.addFolder('scene');

        this.instance.traverse((child) => {
            switch (child.name) {
                case 'book': {
                    this.book = child;
                    this.book.material = this.materials.items.basic.scene1;
                    break;
                }
                case 'merge1': {
                    this.merge1 = child;
                    this.merge1.material = this.materials.items.basic.scene1;
                    break;
                }
                case 'lampSpot': {
                    this.lampSpot = child;
                    this.lampSpot.material = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
                    break;
                }

                default: break;
            }
            if (this.debug) this.sceneFolder.add(child, 'visible').name(child.name);
        });
    }

    setFirstSceneTransition() {
        this.book.scale.set(1.00, 0.01, 0.95);
        this.merge1.scale.set(0.01, 0.01, 0.01);
        this.instance.visible = true;

        const targetA = this.merge1.scale;
        const targetB = this.book.scale;

        this.path = [];
        this.path.push({ target: targetA,
                         delay: 3.0,
                         duration: 0.8,
                         x: 1,
                         z: 1,
                         ease: 'Bounce.easeOut',
                         label: 'sceneStart',
        });
        this.path.push({ target: targetA,
                         delay: 0.2,
                         duration: 0.5,
                         y: 1,
                         ease: 'Power1.easeOut',
                         label: '<',
        });
        this.path.push({ target: targetB,
                         delay: 0.5,
                         duration: 0.8,
                         y: 1.0,
                         z: 1.0,
                         ease: 'Bounce.easeOut',
                         label: '<',
        });

        this.path.forEach((obj) => {
            const { target, label, ...props } = obj;
            this.timeline.to(target, props, label);
        });
    }
}

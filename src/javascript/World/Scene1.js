import * as THREE from 'three';

export default class Scene1 {
    constructor(_option) {
        this.time = _option.time;
        this.sizes = _option.sizes;
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

        this.setScene();
        this.setDOM();
        this.setTraverse();
    }

    setScene() {
        this.parameters = {};
        this.parameters.rotate = 1.2;

        this.instance = this.resources.items.scene1.scene;
        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.visible = false;
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.container.add(this.instance);

        this.text = [];
        this.text1 = {};
        this.text2 = {};
        this.text.push(this.text1);
        this.text.push(this.text2);

        this.text1.name = 'text1';
        this.text1.className = 'text intro';
        this.text1.innerText = 'An Unique Decoration';
        this.text1.config = { top: '18%', right: '13%' };

        this.text2.name = 'text2';
        this.text2.className = 'text intro';
        this.text2.innerText = 'Inspire your Creativity';
        this.text2.config = { bottom: '22%', left: '10%' };

        // texts positioning parameters (on mobile)
        if (this.sizes.width < 768) {
            this.text1.config = { top: '22%', right: '3%' };
            this.text2.config = { bottom: '20%', left: '3%' };
        }
    }

    setDOM() {
        this.$content = document.querySelector('.content');

        this.text.forEach((value) => {
            const text = value;

            text.$point = document.createElement('DIV');
            text.$point.className = text.className;
            text.$point.innerText = text.innerText;

            text.$point.style.top = text.config.top;
            text.$point.style.bottom = text.config.bottom;
            text.$point.style.right = text.config.right;
            text.$point.style.left = text.config.left;

            this.$content.appendChild(text.$point);
        });
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
        this.book.scale.set(1.00, 0.2, 0.95);
        this.merge1.scale.set(0.0, 0.5, 0.0);
        this.instance.visible = true;

        const targetA = this.merge1.scale;
        const targetB = this.book.scale;

        this.path = [];
        this.path.push({ target: targetA,
                         delay: 3.0,
                         duration: 1.2,
                         x: 1,
                         z: 1,
                         ease: 'Bounce.easeOut',
                         label: 'sceneStart',
        });
        this.path.push({ target: targetA,
                         delay: 1.0,
                         duration: 0.5,
                         y: 1.0,
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

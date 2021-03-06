import * as THREE from 'three';

export default class Role {
    constructor(_option) {
        this.$canvas = _option.$canvas;
        this.resources = _option.resources;
        this.time = _option.time;
        this.debug = _option.debug;
        this.controls = _option.controls;
        this.light = _option.light;
        this.timeline = _option.timeline;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;
        this.callbacks = {};

        if (this.debug) {
            this.debugFolder = this.debug.addFolder('role');
            // this.debugFolder.open();
        }

        this.setRole();
        this.setTraverse();
        this.setRaycasterBox();
        this.setPenGroup();
        this.setAnimation();
    }

    setRole() {
        this.parameters = {};
        this.parameters.rotate = 1.2;
        this.parameters.tilt = 0;
        this.parameters.speed = 0.0005;
        this.parameters.selfSpeed = 0;
        this.parameters.metalness = 0;
        this.parameters.lightIntensity = 0;
        this.parameters.color = '#000000';
        this.parameters.spinning = false;

        // original pen
        this.instance = this.resources.items.pen.scene;
        this.instance.scale.set(3, 3, 3);
        this.instance.position.set(0, 0, 0);
        this.instance.rotation.y = Math.PI * this.parameters.rotate;
        this.container.add(this.instance);

        // low poly pen
        this.instanceMin = this.resources.items.penMin.scene;
        this.instanceMin.scale.set(3, 3, 3);
        this.instanceMin.position.set(0, 0, 0);
        this.instanceMin.rotation.y = Math.PI * this.parameters.rotate;
        this.instanceMin.visible = false;
        this.container.add(this.instanceMin);
    }

    setTraverse() {
        if (this.debug) this.penFolder = this.debugFolder.addFolder('pen');
        // original pen
        this.instance.traverse((child) => {
            switch (child.name) {
                // pen only
                case 'pen': this.pen = child; break;
                // this.pen is an Object3D which contains all the 'pen only' related meshes
                case 'penBody': this.penBody = child; break;
                case 'penHead': this.penHead = child; break;
                case 'penPeak': this.penPeak = child; break;
                case 'penRing': this.penRing = child; break;

                // pen base only
                case 'ring': this.ring = child; break;
                case 'base1': this.base1 = child; break;
                case 'base2': this.base2 = child; break;

                // labels for surrounding words (Object3D)
                case 'label1': this.label1 = child; break;
                case 'label2': this.label2 = child; break;

                // low poly meshes for Raycaster
                case 'penBox': this.penBox = child; break;
                case 'ringBox': this.ringBox = child; break;
                case 'base1Box': this.base1Box = child; break;
                case 'base2Box': this.base2Box = child; break;

                default: break;
            }
            if (this.debug) this.penFolder.add(child, 'visible').name(child.name);
        });

        if (this.debug) this.penBakedFolder = this.debugFolder.addFolder('pen baked');
        // low poly pen
        this.instanceMin.traverse((child) => {
            switch (child.name) {
                case 'mergePen': this.mergePen = child; break;
                case 'mergeBase': this.mergeBase = child; break;
                default: break;
            }
            if (this.debug) this.penBakedFolder.add(child, 'visible').name(child.name);
        });
    }

    // hide all the meshes for Raycaster
    setRaycasterBox() {
        const boxes = [this.penBox, this.ringBox, this.base1Box, this.base2Box];
        boxes.forEach((value) => {
            const mesh = value;
            mesh.material.transparent = true;
            mesh.material.opacity = 0;
        });
    }

    setPenGroup() {
        this.instancePen = new THREE.Object3D();
        this.instancePen.name = 'pen instance';
        this.instancePen.rotation.x = Math.PI * this.parameters.tilt;

        // Before: this.pen -> 'pen only' meshes
        while (this.pen.children.length) this.instancePen.add(this.pen.children[0]);
        // After: this.pen -> this.instancePen -> 'pen only' meshes
        this.pen.add(this.instancePen);
        // can rotate this.pen and this.instancePen at the same time independently (convinient for animation)

        if (this.debug) {
            this.penAxes = new THREE.AxesHelper();
            this.instancePenAxes = new THREE.AxesHelper();
            this.pen.add(this.penAxes);
            this.instancePen.add(this.instancePenAxes);

            this.debugFolder.add(this.penAxes, 'visible').name('penAxes');
            this.debugFolder.add(this.instancePenAxes, 'visible').name('instancePenAxes');
            this.debugFolder.add(this.parameters, 'speed').min(0).max(0.01).step(0.00001).name('speed');
            this.debugFolder.add(this.parameters, 'selfSpeed').min(0).max(0.01).step(0.00001).name('self speed');

            this.debugFolder.add(this.parameters, 'rotate').min(0).max(2).step(0.01).name('rotate')
                            .onChange(() => { this.instance.rotation.y = Math.PI * this.parameters.rotate; });

            this.debugFolder.add(this.parameters, 'tilt').min(0).max(0.2).step(0.001).name('tilt')
                            .onChange(() => { this.instancePen.rotation.x = Math.PI * this.parameters.tilt; });

            this.debugFolder.add(this.parameters, 'metalness').min(0).max(1).step(0.01).name('metalness')
                            .onChange(() => { this.penBody.material.metalness = this.parameters.metalness; });

            this.debugFolder.add(this.parameters, 'lightIntensity').min(0).max(10).step(0.1).name('lightIntensity')
                            .onChange(() => { this.light.ambientLight.intensity = this.parameters.lightIntensity; });

            this.debugFolder.addColor(this.parameters, 'color').name('color')
                            .onChange(() => { this.penBody.material.color.set(this.parameters.color); });
        }
    }

    // pen animation
    setAnimation() {
        // set animation parameters into tick function
        this.callbacks.slowRotation = this.time.on('tick', () => {
            const thetaA = this.time.delta * this.parameters.selfSpeed;
            const thetaB = this.time.delta * this.parameters.speed;
            this.instancePen.rotation.y += thetaA;
            this.pen.rotateOnAxis(new THREE.Vector3(0, 1, 0), thetaB);
        });

        // pen clicked animation using GSAP
        const targetA = this.parameters;
        const targetB = this.instancePen.rotation;
        const { selfSpeed, speed } = targetA;
        const { x } = targetB;

        this.path = [];
        // start rotate config.
        this.path.push({ target: targetA,
                         delay: 0,
                         duration: 0.5,
                         selfSpeed: 0.01,
                         speed: 0.005,
                         ease: 'Power1.easeOut',
                         label: '',
        });
        this.path.push({ target: targetB,
                         delay: 0,
                         duration: 0.5,
                         x: 0.001,
                         ease: 'Power1.easeOut',
                         label: '<',
        });
        // back to the original state config.
        this.path.push({ target: targetA,
                         delay: 0,
                         duration: 4.0,
                         selfSpeed,
                         ease: 'Power4.easeIn',
                         label: '>',
        });
        this.path.push({ target: targetA,
                         delay: 0,
                         duration: 7.0,
                         speed,
                         ease: 'Power1.easeIn',
                         label: '<',
        });
        this.path.push({ target: targetB,
                         delay: 0,
                         duration: 2.0,
                         x,
                         ease: 'Power1.easeOut',
                         label: '<',
        });
        // execute GSAP animation when the pen is clicked
        this.callbacks.spinning = this.time.on('shortClick', async () => {
            this.intersects = this.controls.raycaster.intersectObjects([this.penBox]);
            if (this.intersects.length && !this.timeline.isActive()) {
                this.parameters.spinning = true;
                this.path.forEach((obj) => {
                    const { target, label, ...props } = obj;
                    if (label) {
                        this.timeline.to(target, props, label);
                    } else {
                        this.timeline.to(target, props);
                    }
                });
                await this.timeline;
                this.parameters.spinning = false;
            }
        });
    }

    // change pen color when 'shortClick' event is triggered, and then trigger the 'colorChange' event
    setColor() {
        this.rayColorMeshes = [];
        this.rayColorMeshes.push(this.base1Box);
        this.rayColorMeshes.push(this.base2Box);
        this.rayColorMeshes.push(this.ringBox);

        this.colorIndex = 0;
        this.colors = [];
        this.colors.push({ color: '#131318', metalness: 0.90, lightIntensity: 5.0 });
        this.colors.push({ color: '#000000', metalness: 0.00, lightIntensity: 0.0 });

        this.callbacks.colorChange = this.time.on('shortClick', () => {
            this.intersects = this.controls.raycaster.intersectObjects(this.rayColorMeshes);
            if (this.intersects.length && !this.timeline.isActive()) {
                // change the material color of the pen body mesh
                const { color, metalness, lightIntensity } = this.colors[this.colorIndex];
                // all meshes share the same material, so the entire pen meshes color will also change
                this.penBody.material.color.set(color);
                this.penBody.material.metalness = metalness;
                this.light.ambientLight.intensity = lightIntensity;

                this.colorIndex += 1;
                this.colorIndex %= this.colors.length;

                this.time.trigger('colorChange');
            }
        // would execute after removing the event
        }, () => {
            const { color, metalness, lightIntensity } = this.colors[this.colors.length - 1];
            this.penBody.material.color.set(color);
            this.penBody.material.metalness = metalness;
            this.light.ambientLight.intensity = lightIntensity;
        });
    }

    // mouse cursor change when hovering on the pen meshes
    setMouse() {
        this.hoverMeshes = [];
        this.hoverMeshes.push(this.base1Box);
        this.hoverMeshes.push(this.base2Box);
        this.hoverMeshes.push(this.ringBox);
        this.hoverMeshes.push(this.penBox);

        this.callbacks.mouseHover = this.time.on(('tick'), () => {
            this.intersects = this.controls.raycaster.intersectObjects(this.hoverMeshes);
            if (this.intersects.length && !this.timeline.isActive()) {
                this.$canvas.classList.add('hover');
            } else {
                this.$canvas.classList.remove('hover');
            }
        // would execute after removing the event
        }, () => this.$canvas.classList.remove('hover'));
    }

    setFirstSceneTransition() {
        this.timeline.add(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            this.instance.visible = false;
            this.instanceMin.visible = true;
        }, 'sceneStart');
    }
}

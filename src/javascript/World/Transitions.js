import * as THREE from 'three';

export default class Transitions {
    constructor(_option) {
        this.time = _option.time;
        this.camera = _option.camera;
        this.particles = _option.particles;
        this.role = _option.role;
        this.scene1 = _option.scene1;
        this.labels = _option.labels;
        this.light = _option.light;
        this.timeline = _option.timeline;
        this.renderer = _option.renderer;
    }

    async penFocus() {
        this.camera.controls.enabled = false;

        this.camera.setPenTransition();
        this.particles.setPenTransition();
        this.light.setPenTransition();

        await this.timeline;

        this.timeline.clear();
        this.labels.start();
        this.role.setColor();
        this.role.setMouse();
        this.particles.setControls();

        this.camera.controls.enabled = true;
    }

    async firstSceneFocus() {
        this.camera.controls.enabled = false;
        this.renderer.toneMapping = THREE.NoToneMapping;

        this.scene1.setFirstSceneTransition();
        this.role.setFirstSceneTransition();
        this.particles.setFirstSceneTransition();
        this.camera.setFirstSceneTransition();
        this.light.setFirstSceneTransition();

        await this.timeline;

        this.timeline.clear();
        this.camera.controls.enabled = true;
    }

    removePenCallbacks() {
        this.time.remove(this.labels.callbacks.projection);
        this.time.remove(this.labels.callbacks.hidden);
        this.time.remove(this.particles.callbacks.colorChange);
        this.time.remove(this.particles.callbacks.moveUp);
        this.time.remove(this.role.callbacks.slowRotation);
        this.time.remove(this.role.callbacks.colorChange);
        this.time.remove(this.role.callbacks.spinning);
        this.time.remove(this.role.callbacks.mouseHover);
    }
}

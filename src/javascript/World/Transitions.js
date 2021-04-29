export default class Transitions {
    constructor(_option) {
        this.time = _option.time;
        this.camera = _option.camera;
        this.particles = _option.particles;
        this.role = _option.role;
        this.labels = _option.labels;
        this.light = _option.light;
        this.timeline = _option.timeline;
    }

    async penFocus() {
        this.camera.setPenTransition();
        this.particles.setPenTransition();
        this.light.setPenTransition();

        await this.timeline;

        this.labels.start();
        this.role.setColor();
        this.role.setMouse();
        this.particles.setControls();
        this.camera.controls.enabled = true;
    }

    async firstSceneFocus() {
        this.particles.setFirstSceneTransition();
        this.role.setPenMin();

        await this.timeline;
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

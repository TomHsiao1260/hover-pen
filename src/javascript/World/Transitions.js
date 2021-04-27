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

    async setPen() {
        this.camera.setTransition();
        this.particles.setTransition();
        this.light.setTransition();

        await this.timeline;

        this.labels.start();
        this.role.setColor();
        this.role.setMouse();
        this.particles.setControls();
        this.camera.controls.enabled = true;

        await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    setPenEnd() {
        this.time.remove(this.labels.callbacks.projection);
        this.time.remove(this.labels.callbacks.hidden);
        this.time.remove(this.particles.callbacks.colorChange);
        this.time.remove(this.particles.callbacks.moveUp);
        this.time.remove(this.role.callbacks.slowRotation);
        this.time.remove(this.role.callbacks.colorChange);
        this.time.remove(this.role.callbacks.spinning);
        this.time.remove(this.role.callbacks.mouseHover);

        this.light.container.visible = false;
    }
}

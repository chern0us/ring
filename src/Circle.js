import Vector from './Vector';

export default class Circle {
    constructor(x, y, i, colorPalette) {
        this.i = i;
        this.pos = new Vector(x, y);
        this.speed = new Vector();
        this.acc = new Vector();
        this.speed = new Vector();
        this.maxSpeed = 0.5;
        this.target = this.pos.copy();
        this.initialTarget = this.pos.copy();
        this.colorPalette = colorPalette;
        this.color = `#${this.colorPalette.colourAt(i)}`.toLocaleUpperCase();
        this.visible = true;
        this.radius = 10;
        this.initialRadius = 15;
    }
    static getOppostitePos(pos, x0, y0) {
        const { x, y } = pos;
        const xOp = x0 - (x - x0);
        const yOp = y0 - (y - y0);
        return new Vector(xOp, yOp);
    }
    static getPositionInCircle(i, x0, y0, ringRadius, totalPointsCount) {
        const x = (Math.cos(2 * Math.PI * i / totalPointsCount) * ringRadius) + x0;
        const y = (Math.sin(2 * Math.PI * i / totalPointsCount) * ringRadius) + y0;
        return new Vector(x, y);
    }
    static makeRingCreator(x0, y0, ringRadius, totalPointsCount, colorPalette) {
        return (i) => {
            const x = (Math.cos(2 * Math.PI * i / totalPointsCount) * ringRadius) + x0;
            const y = (Math.sin(2 * Math.PI * i / totalPointsCount) * ringRadius) + y0;
            return new Circle(x, y, i, colorPalette);
        };
    }
    setRadius(radius) {
        this.radius = radius;
    }
    resetRadius() {
        this.radius = 30;
    }
    update() {
        this.speed.add(this.acc);
        this.pos.add(this.speed);
        this.acc.set(0, 0);
        return this;
    }
    force(f) {
        this.acc.add(f);
        return this;
    }
    setTarget(target) {
        this.target = target;
    }
    setInitialTarget(target) {
        this.initialTarget = target;
    }
    resetAcc() {
        this.acc = new Vector();
    }
    resetTarget() {
        this.target = this.initialTarget.copy();
    }

    resetPos() {
        this.pos = this.initialTarget.copy();
    }
    setPos(pos) {
        this.pos = pos;
    }
    activate() {
        this.active = true;
    }
    lookFor(tar) {
        const dir = tar ? tar.copy() : this.target.copy();
        dir.sub(this.pos);
        const steer = dir.sub(this.speed);
        steer.limit(this.maxSpeed);
        this.force(steer);
        return this;
    }
    deactivate() {
        this.active = false;
    }

    setSpeed(speed) {
        this.maxSpeed = speed;
    }
    resetSpeed() {
        this.speed = new Vector();
    }
    setColor(color) {
        this.color = color;
    }
    setColorPalette(colorPalette) {
        this.colorPalette = colorPalette;
        this.setColor(`#${this.colorPalette.colourAt(this.i)}`.toLocaleUpperCase());
    }
    draw(ctx) {
        const { pos, radius, color } = this;
        const { x, y } = pos;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.fill();
        return this;
    }
}


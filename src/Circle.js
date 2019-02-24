import Vector from './Vector';
import Rainbow from 'rainbowvis.js';
const colorPalette = new Rainbow();
colorPalette.setSpectrum('81F4E1', '5EC2B7', '#F4ACB7', '#339999', '81F4E1', '5EC2B7', '#F4ACB7');
colorPalette.setNumberRange(0, 200);
export default class Circle {
    constructor(x, y, i) {
        this.pos = new Vector(x, y);
        this.speed = new Vector();
        this.acc = new Vector();
        this.speed = new Vector();
        this.maxSpeed = 0.5;
        this.target = this.pos.copy();
        this.initialTarget = this.pos.copy();
        this.color = `#${colorPalette.colourAt(i)}`.toLocaleUpperCase();
        this.visible = true;
        this.radius = 10;
        this.initialRadius = 10;
    }
    static makeRingCreator(x0, y0, ringRadius, totalPointsCount) {
        return (i) => {
            const x = (Math.cos(2 * Math.PI * i / totalPointsCount) * ringRadius) + x0;
            const y = (Math.sin(2 * Math.PI * i / totalPointsCount) * ringRadius) + y0;
            return new Circle(x, y, i);
        };
    }
    setRadius(radius) {
        this.radius = radius;
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
    setTarget(x, y) {
        this.target = new Vector(x, y);
    }

    resetTarget() {
        this.target = this.initialTarget.copy();
    }

    resetPos() {
        this.pos = this.initialTarget.copy();
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
        this.maxSpeed = 0.5;
    }
    setColor(color) {
        this.color = color;
    }
    resetRadius() {
        this.radius = this.initialRadius;
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


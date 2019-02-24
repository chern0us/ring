import Background from 'bg-canvases';
import Circle from './Circle';
import Vector from './Vector';


const bg = new Background();

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');
const scaleDpi = (...contexts) => {
    const dpr = window.devicePixelRatio || 1,
        scale = ctx => {
            const rect = ctx.canvas.getBoundingClientRect();
            ctx.canvas.width = rect.width * dpr;
            ctx.canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
    contexts.forEach(c => scale(c));
};
const state = {
    mouseX: 0,
    mouseY: 0,
    active: false,
};

scaleDpi(ctx);

const creator = Circle.makeRingCreator(250, 250, 150 - 10, 150);

bg.createLayer('ring', ctx, creator, 150).draw();
bg.setAnimation((c, i, all, ctx) => {
    ctx.globalAlpha = 0.8;
    const { mouseX, mouseY } = state;
    const mousePos = new Vector(mouseX, mouseY);
    const distToOrigin = mousePos.distanceTo(c.initialTarget);
    const radialDist = c.pos.distanceTo(c.initialTarget);
    const radiusMrg = c.initialRadius + radialDist / 5;
    const radiusPlus = radiusMrg < 30 ? radiusMrg : 30;
    if (state.active) {
        c.setRadius(c.initialRadius + radiusPlus);
        if (distToOrigin < c.radius * 2 && distToOrigin > c.radius) {
            c.lookFor(mousePos).update();
        }
        else {
            c.lookFor(c.initialTarget).update();
        }
    }
    else {
        c.setRadius(c.initialRadius + radiusPlus);
        c.resetTarget();
        c.resetSpeed();
        c.lookFor().update();
    }
}, 'ring');

const tick = () => {

    bg.animate().draw();

    requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

const getMousePos = (canvas, evt) => {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};
canvas.addEventListener('mousemove', (e) => {
    bg.start();
    const pos = getMousePos(canvas, e);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
    state.active = true;
});
canvas.addEventListener('mouseleave', () => { state.active = false; });
import Background from 'bg-canvases';
import Circle from './Circle';
import Vector from './Vector';
import classnames from 'classnames';

const bg = new Background();

const canvas = document.getElementById('canvas');
const flow = document.getElementById('flow');
const swap = document.getElementById('swap');
const bubble = document.getElementById('bubble');

const touchpad = document.getElementById('touchpad');
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
const cfg = {
    quantity: 150,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    circleRadius: 110,
    alpha: 0.8,
};
const state = {
    mouseX: 0,
    mouseY: 0,
    active: false,
};

scaleDpi(ctx);
ctx.globalAlpha = cfg.alpha;
const creator = Circle.makeRingCreator(cfg.centerX, cfg.centerY, cfg.circleRadius, cfg.quantity);

cfg.bubble = (c) => {

    const { mouseX, mouseY } = state;
    const mousePos = new Vector(mouseX, mouseY);
    const distToOrigin = mousePos.distanceTo(c.initialTarget);
    const radialDist = c.pos.distanceTo(c.initialTarget);
    const radiusMrg = c.initialRadius + radialDist / 5;
    const radiusPlus = radiusMrg < 30 ? radiusMrg : 30;
    if (state.active) {
        c.setRadius(c.initialRadius + radiusPlus);
        if (distToOrigin < c.radius * 2.5 && distToOrigin > c.radius) {
            c.setTarget(mousePos);
        }
        else {
            c.setTarget(c.initialTarget);
        }
    }
    else {
        c.setRadius(c.initialRadius + radiusPlus);
        c.resetTarget();
        // c.resetSpeed();
    }
    c.lookFor().update();
};

cfg.swap = (c) => {

    const oppositePos = Circle.getOppostitePos(c.initialTarget, cfg.centerX, cfg.centerY);
    // const ditstToOpposite = c.pos.distanceTo(oppositePos);

    c.setSpeed(1 * Math.random() + 1);
    if (state.active) {
        c.setTarget(oppositePos);
        // if (ditstToOpposite <= c.radius * 2) {
        //     c.setPos(oppositePos);
        //     c.resetAcc();
        //     c.resetSpeed();
        // }
    }
    else {
        c.resetTarget();
        c.resetAcc();
        // const distToInitial = c.pos.distanceTo(c.initialTarget);
        // if (distToInitial <= c.radius * 2) {
        //     c.resetPos();
        //     c.resetAcc();
        //     c.resetSpeed();
        //     c.resetTarget();
        // }
    }
    c.lookFor().update();
};
cfg.flow = (c, i, circles) => {
    const { mouseX, mouseY } = state;
    const mousePos = new Vector(mouseX, mouseY);
    const index = parseInt(i, 10) + 1;
    const neihbour = circles[index];

    if (state.active) {
        c.setSpeed(1);
        if (index === cfg.quantity) {
            c.setTarget(mousePos);
        } else
        if (neihbour) {
            c.setSpeed(10);
            c.setTarget(neihbour.pos);
        }
    } else {
        c.setSpeed(10);
        c.resetSpeed();
        c.resetTarget();
    }
    c.lookFor().update();
};
bg.createLayer('ring', ctx, creator, 150).draw();
bg.setAnimation(cfg.bubble, 'ring');

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
touchpad.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
    state.active = true;
});
touchpad.addEventListener('mouseleave', () => { state.active = false; });

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cfg.centerX = window.innerWidth / 2;
    cfg.centerY = window.innerHeight / 2;
    bg.applyOnEach((c => {
        const newInitialTarget = Circle.getPositionInCircle(
            parseInt(c.i, 10), cfg.centerX, cfg.centerY, cfg.circleRadius, cfg.quantity);
        c.setInitialTarget(newInitialTarget);
    }));
    ctx.globalAlpha = cfg.alpha;
};
const changeFunction = (e) => {
    bg.applyOnEach(c => {
        c.setSpeed(0.5);
        c.resetRadius();
    });
    const functionName = e.target.id;
    bg.setAnimation(cfg[functionName], 'ring');
    const getClass = (id) => {
        return classnames('button', {
            active: functionName === id,
        });
    };
    flow.classList = getClass('flow');
    bubble.classList = getClass('bubble');
    swap.classList = getClass('spap');

};
flow.onclick = changeFunction;
bubble.onclick = changeFunction;
swap.onclick = changeFunction;
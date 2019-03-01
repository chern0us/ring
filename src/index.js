import Background from 'bg-canvases';
import Circle from './Circle';
import Vector from './Vector';
import classnames from 'classnames';
import Rainbow from 'rainbowvis.js';
import Vue from 'vue';
import uniqueId from 'lodash/uniqueId';

const bg = new Background();

const colorPalette = new Rainbow();

var colorlistA = new Vue({
    el: '#colorpicker',
    data: {
        items: [
            { colorcell: { color: '#81F4E1', id: uniqueId() } },
            { colorcell: { color: '#5EC2B7', id: uniqueId() } },
            { colorcell: { color: '#F4ACB7', id: uniqueId() } },
            { colorcell: { color: '#339999', id: uniqueId() } },
            { colorcell: { color: '#81F4E1', id: uniqueId() } },
        ]
    },
    methods: {
        add: () => {
            const swatch = document.getElementById('color');
            const color = swatch.value;
            if (colorlistA.items.length < 20)
                colorlistA.items = [...colorlistA.items, { colorcell: { color, id: uniqueId() } }];
            const colors = colorlistA.$data.items.map(item => item.colorcell.color);
            colorPalette.setSpectrum(...colors);
            bg.applyOnEach(c => c.setColorPalette(colorPalette));
        },
        remove: (i) => {
            if (colorlistA.items.length > 2) {
                colorlistA.items.splice(i, 1);
                const colors = colorlistA.$data.items.map(item => item.colorcell.color);
                colorPalette.setSpectrum(...colors);
                bg.applyOnEach(c => c.setColorPalette(colorPalette));
            } else if (colorlistA.items.length === 2) {
                colorlistA.items.splice(i, 1);
                const colors = colorlistA.$data.items.map(item => item.colorcell.color);
                colorPalette.setSpectrum(...colors, ...colors);
                bg.applyOnEach(c => c.setColorPalette(colorPalette));
            }
        },
    }
});
const colors = colorlistA.$data.items.map(item => item.colorcell.color);
colorPalette.setSpectrum(...colors);
const canvas = document.getElementById('canvas');
const flow = document.getElementById('flow');
const swap = document.getElementById('swap');
const bubble = document.getElementById('bubble');
const ctx = canvas.getContext('2d');
const resizeCanvas = () => {
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

const cfg = {
    quantity: 150,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    circleRadius: 150,
    alpha: 1,
};
const state = {
    mouseX: 0,
    mouseY: 0,
    active: false,
};


colorPalette.setNumberRange(0, cfg.quantity);
resizeCanvas();
ctx.globalAlpha = cfg.alpha;
const creator = Circle.makeRingCreator(cfg.centerX, cfg.centerY, cfg.circleRadius, cfg.quantity, colorPalette);

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
    }
    c.lookFor().update();
};

cfg.swap = (c) => {
    const oppositePos = Circle.getOppostitePos(c.initialTarget, cfg.centerX, cfg.centerY);
    c.setSpeed(1 * Math.random() + 1);
    if (state.active) {
        c.setTarget(oppositePos);
    }
    else {
        c.resetTarget();
        c.resetAcc();
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
window.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);
    state.mouseX = pos.x;
    state.mouseY = pos.y;
    state.active = true;
});
canvas.addEventListener('mouseleave', () => { state.active = false; });


window.onresize = resizeCanvas;
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
    swap.classList = getClass('swap');

};
flow.onclick = changeFunction;
bubble.onclick = changeFunction;
swap.onclick = changeFunction;

const alphaInput = document.querySelector('input[name=alpha]');
alphaInput.addEventListener('input', (e) => {
    const alpha = e.target.value;
    cfg.alpha = alpha;
    ctx.globalAlpha = alpha;
});

// colorpicker.onmousedown = () => {

//     const className = classnames('colorpicker', { active: true });
//     const listClassName = classnames('colorlist', { active: true });
//     colorpicker.classList = className;
//     colorlist.classList = listClassName;

//     clearTimeout(timer);

// };
// colorpicker.onmouseleave = () => {
//     timer = setTimeout(function () {
//         const className = classnames('colorpicker', { active: false });
//         const listClassName = classnames('colorlist', { active: false });
//         colorpicker.classList = className;
//         colorlist.classList = listClassName;
//     }, delay);
// };
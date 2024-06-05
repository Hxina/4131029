import {
    adjustCanvasSize as adjustBlossomCanvasSize,
    startBlossomAnimation,
    stopBlossomAnimation,
    resumeBlossomAnimation
} from './blossom.js';

import {
    adjustCanvasSize as adjustHeartCanvasSize,
    startHeartAnimation,
    stopHeartAnimation,
    resumeHeartAnimation,
    addMouseMoveEventListener,
    addClickEventListener
} from './heartWithConfetti.js';

let canvas = document.getElementById("heartWithConfettiCanvas");

function adjustCanvasSizes() {
    adjustBlossomCanvasSize();
    adjustHeartCanvasSize();
}

function startAnimations() {
    startBlossomAnimation();
    startHeartAnimation();
}

function stopAnimations() {
    stopBlossomAnimation();
    stopHeartAnimation();
}

function resumeAnimations() {
    resumeBlossomAnimation();
    resumeHeartAnimation();
}

window.onload = function () {
    adjustCanvasSizes();
    startAnimations();
    addMouseMoveEventListener(canvas);
    addClickEventListener(canvas);
};

window.addEventListener('resize', adjustCanvasSizes);
window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        stopAnimations();
    } else {
        resumeAnimations();
    }
});

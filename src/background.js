(function (window) {
  class FrameAnimater {
    constructor() {
      this.callback = (_) => {};
      this.lastTime = 0;
      this.interval = Number.EPSILON;
      this.id = null;
      this._animate = this._animate.bind(this);
    }
    _animate() {
      this.id = requestAnimationFrame(this._animate); //回调更新动画
      var nowTime = performance.now();
      var elapsed = nowTime - this.lastTime;
      if (elapsed > this.interval) {
        this.lastTime = nowTime - (elapsed % this.interval);
        this.callback(nowTime);
      }
    }
    start() {
      if (this.id) return;
      this.lastTime = performance.now();
      this.id = requestAnimationFrame(this._animate);
    }
    stop() {
      cancelAnimationFrame(this.id);
      this.id = null;
    }
    setCallback(callback) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      this.callback = callback;
    }
    setFrameRate(frameRate) {
      this.interval = Math.abs(1e3 / frameRate);
      if (!isFinite(this.interval)) this.interval = Number.EPSILON;
    }
  }

  const canvas = document.getElementById("background-canvas");
  const ctx = canvas.getContext("2d");

  const PX_RATIO = window.devicePixelRatio || 1;
  const DENSE_INVERSE = 1.5e4;
  const SHAKE_RATE = 0.005;
  const numOfBubbles = parseInt(
    ((window.innerWidth * window.innerHeight) / DENSE_INVERSE).toFixed(0)
  );
  let bubbleArray = [];

  window.addEventListener("resize", resizeCanvas, false);
  window.addEventListener("resize", generateBubbles, false);
  window.addEventListener("orientationchange", resizeCanvas, false);
  window.addEventListener("orientationchange", generateBubbles, false);

  /**
   * 将原范围内某个数值映射到新的范围
   * @param {number} g 给定值
   * @param {number} as 原范围开始
   * @param {number} ae 原范围结束
   * @param {number} ts 目标范围开始
   * @param {number} te 目标范围结束
   * @returns {number} 新区间的映射值
   */
  function map(g, as, ae, ts, te) {
    if (ts >= te || as >= ae || g < as || g > ae) return NaN;
    let deltaT, deltaA, k;
    deltaT = te - ts;
    deltaA = ae - as;
    k = deltaT / deltaA;
    return ts + (g - as) * k;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth * PX_RATIO;
    canvas.height = window.innerHeight * PX_RATIO;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(PX_RATIO, PX_RATIO);
  }

  function generateBubbles() {
    bubbleArray = [];
    for (let i = 0; i < numOfBubbles; i++) {
      bubbleArray.push({
        i: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseRadius: 25 + Math.random() * 50,
        baseAlpha: Math.random() * 0.3,
        velocity: 4 + Math.random() * 1,
        sinOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < numOfBubbles; i++) {
      let curBubble = bubbleArray[i];
      let radius = curBubble.baseRadius * map(curBubble.y, 0, window.innerHeight + 75, 0, 1);
      ctx.globalAlpha = curBubble.baseAlpha * map(curBubble.y, 0, window.innerHeight + 75, 0, 1);
      ctx.fillStyle = `rgb(255, 255, 255)`;
      ctx.beginPath();
      ctx.arc(curBubble.x, curBubble.y, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      // Movements
      curBubble.y -= curBubble.velocity;
      if (curBubble.y - radius * 2 <= 0) {
        curBubble.y = window.innerHeight + curBubble.baseRadius * 2;
      }
      if (i % 2 === 1) {
        curBubble.x += Math.sin((Date.now() * SHAKE_RATE) / 4 + curBubble.sinOffset) * 2;
      } else {
        curBubble.x -= Math.sin((Date.now() * SHAKE_RATE) / 4 + curBubble.sinOffset) * 2;
      }
    }
    ctx.globalAlpha = 1;
  }

  function animate() {
    const bubbleAnimator = new FrameAnimater();
    bubbleAnimator.setCallback(loop);
    bubbleAnimator.setFrameRate(30);
    resizeCanvas();
    generateBubbles();
    bubbleAnimator.start();
  }

  animate();
})(window);

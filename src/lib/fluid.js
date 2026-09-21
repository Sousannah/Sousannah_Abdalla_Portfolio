/**
 * A WebGL2 fluid simulation for the landing backdrop.
 *
 * This is Stam's stable-fluids method on the GPU: advect the velocity field,
 * add vorticity confinement to bring back the small curls that advection
 * smears away, then make the field divergence-free with a few Jacobi pressure
 * iterations. A separate dye field is carried along by that velocity and is
 * what you actually see. Moving the pointer injects both velocity and dye.
 *
 * Everything is decorative: the canvas never takes pointer events, and if
 * anything here is unsupported the caller simply gets `supported: false` and
 * the page renders without it.
 */

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 uTexelSize;

void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexelSize.x, 0.0);
  vR = vUv + vec2(uTexelSize.x, 0.0);
  vT = vUv + vec2(0.0, uTexelSize.y);
  vB = vUv - vec2(0.0, uTexelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const COPY = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;

void main () {
  fragColor = texture(uTexture, vUv);
}`;

const CLEAR = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float uValue;

void main () {
  fragColor = uValue * texture(uTexture, vUv);
}`;

/** A soft gaussian blob of colour and momentum at the pointer. */
const SPLAT = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTarget;
uniform float uAspectRatio;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;

void main () {
  vec2 p = vUv - uPoint.xy;
  p.x *= uAspectRatio;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

/**
 * Semi-Lagrangian advection: look backwards along the velocity field to find
 * where this texel's contents came from. MANUAL_FILTERING is compiled in when
 * the platform cannot filter float textures in hardware.
 */
const ADVECTION = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform vec2 uDyeTexelSize;
uniform float uDt;
uniform float uDissipation;

#ifdef MANUAL_FILTERING
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);

  vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);

  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
#endif

void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - uDt * bilerp(uVelocity, vUv, uTexelSize).xy * uTexelSize;
  vec4 result = bilerp(uSource, coord, uDyeTexelSize);
#else
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
  vec4 result = texture(uSource, coord);
#endif
  // Framerate-independent fade, so the look does not change with refresh rate.
  float decay = 1.0 + uDissipation * uDt;
  fragColor = result / decay;
}`;

const DIVERGENCE = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;

  // Reflect the field at the edges so the fluid does not leak off-screen.
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0)  { L = -C.x; }
  if (vR.x > 1.0)  { R = -C.x; }
  if (vT.y > 1.0)  { T = -C.y; }
  if (vB.y < 0.0)  { B = -C.y; }

  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

/** Push energy back into the vortices advection would otherwise wash out. */
const VORTICITY = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;

void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;

  vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;
  velocity = clamp(velocity, -1000.0, 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT = `#version 300 es
precision mediump float;
precision mediump sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

/**
 * The dye, drawn as-is.
 *
 * Two things make this read as soft vapour rather than flat colour. The dye
 * value is used directly as a premultiplied colour with alpha = its brightest
 * channel, so a faint splat is a faint tint and the page shows through by
 * exactly as much as the dye is weak. And the shading pass treats the dye's own
 * gradient as a surface normal and lights it from the front, which shades the
 * edges of every curl and gives the fluid its sense of depth.
 */
const DISPLAY = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform vec2 uTexelSize;
uniform float uIntensity;

void main () {
  vec3 c = texture(uTexture, vUv).rgb * uIntensity;

  // Light the dye using its own gradient as a normal.
  float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);
  float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);
  vec3 normal = normalize(vec3(dx, dy, length(uTexelSize)));
  float diffuse = clamp(dot(normal, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
  c *= diffuse;

  float alpha = max(c.r, max(c.g, c.b));
  fragColor = vec4(c, clamp(alpha, 0.0, 1.0));
}`;

/* -------------------------------------------------------------------------- */
/* GL plumbing                                                                */
/* -------------------------------------------------------------------------- */

function compile(gl, type, source, defines = '') {
  const withDefines = defines
    ? source.replace('precision', `${defines}\nprecision`)
    : source;

  const shader = gl.createShader(type);
  gl.shaderSource(shader, withDefines);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[fluid] shader failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[fluid] link failed:', gl.getProgramInfoLog(program));
    return null;
  }

  // Cache every uniform location up front; looking them up per frame is waste.
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i += 1) {
    const name = gl.getActiveUniform(program, i).name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  return { program, uniforms };
}

function createFbo(gl, w, h, internalFormat, format, type, filter) {
  gl.activeTexture(gl.TEXTURE0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX: 1 / w,
    texelSizeY: 1 / h,
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

/** A pair of framebuffers to ping-pong between, since GL cannot read and write one texture. */
function createDoubleFbo(gl, w, h, internalFormat, format, type, filter) {
  let read = createFbo(gl, w, h, internalFormat, format, type, filter);
  let write = createFbo(gl, w, h, internalFormat, format, type, filter);

  return {
    width: w,
    height: h,
    texelSizeX: read.texelSizeX,
    texelSizeY: read.texelSizeY,
    get read() {
      return read;
    },
    get write() {
      return write;
    },
    swap() {
      const temp = read;
      read = write;
      write = temp;
    },
  };
}

/** Work out which float render targets this device will actually accept. */
function pickFormats(gl) {
  gl.getExtension('EXT_color_buffer_float');
  const linearFiltering = gl.getExtension('OES_texture_float_linear');

  const supports = (internalFormat, format, type) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;

    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(texture);
    return ok;
  };

  const half = gl.HALF_FLOAT;

  // Half float first: plenty of precision for this, and much kinder on mobile.
  if (supports(gl.RGBA16F, gl.RGBA, half)) {
    return {
      ok: true,
      rgba: { internalFormat: gl.RGBA16F, format: gl.RGBA },
      rg: { internalFormat: gl.RG16F, format: gl.RG },
      r: { internalFormat: gl.R16F, format: gl.RED },
      type: half,
      linearFiltering: Boolean(linearFiltering) || supportsHalfLinear(gl),
    };
  }

  if (supports(gl.RGBA32F, gl.RGBA, gl.FLOAT)) {
    return {
      ok: true,
      rgba: { internalFormat: gl.RGBA32F, format: gl.RGBA },
      rg: { internalFormat: gl.RG32F, format: gl.RG },
      r: { internalFormat: gl.R32F, format: gl.RED },
      type: gl.FLOAT,
      linearFiltering: Boolean(linearFiltering),
    };
  }

  return { ok: false };
}

function supportsHalfLinear(gl) {
  // WebGL2 filters half-float in core, but some drivers still need the hint.
  return Boolean(gl.getExtension('OES_texture_half_float_linear')) || true;
}

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: return { r: v, g: t, b: p };
    case 1: return { r: q, g: v, b: p };
    case 2: return { r: p, g: v, b: t };
    case 3: return { r: p, g: q, b: v };
    case 4: return { r: t, g: p, b: v };
    default: return { r: v, g: p, b: q };
  }
}

/* -------------------------------------------------------------------------- */
/* The simulation                                                             */
/* -------------------------------------------------------------------------- */

const DEFAULTS = {
  simResolution: 128,
  dyeResolution: 1024,
  // Low curl is what keeps the motion laminar. Turn this up and the flow stops
  // drifting and starts tearing itself into chaotic filaments.
  curl: 3,
  // How long a trail lingers, and how long the motion behind it keeps going.
  densityDissipation: 0.5,
  velocityDissipation: 0.2,
  // How much pressure carries between frames. Higher makes the fluid springy.
  pressure: 0.1,
  pressureIterations: 20,
  splatRadius: 0.2,
  splatForce: 6000,
  // How many times a second the trail picks a new hue. Holding a colour for a
  // stretch is what gives the trail coherent bands; rolling it every splat
  // makes neighbouring dye fight and the whole thing turns grey.
  colorUpdateRate: 10,
  intensity: 1,
  // Hue window the splats pick from, 0–1. Defaults to the whole wheel.
  hueStart: 0,
  hueRange: 1,
};

/**
 * Attach a fluid simulation to a canvas.
 * @returns {{supported: boolean, start: Function, stop: Function, destroy: Function, setIntensity: Function}}
 */
export function createFluid(canvas, options = {}) {
  const config = { ...DEFAULTS, ...options };

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  });

  if (!gl) return { supported: false, start() {}, stop() {}, destroy() {}, setIntensity() {} };

  const formats = pickFormats(gl);
  if (!formats.ok) return { supported: false, start() {}, stop() {}, destroy() {}, setIntensity() {} };

  const filtering = formats.linearFiltering ? gl.LINEAR : gl.NEAREST;

  /* -- programs ----------------------------------------------------------- */

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
  if (!vertexShader) return { supported: false, start() {}, stop() {}, destroy() {}, setIntensity() {} };

  const build = (source, defines) => {
    const fragment = compile(gl, gl.FRAGMENT_SHADER, source, defines);
    return fragment ? link(gl, vertexShader, fragment) : null;
  };

  const programs = {
    copy: build(COPY),
    clear: build(CLEAR),
    splat: build(SPLAT),
    advection: build(ADVECTION, formats.linearFiltering ? '' : '#define MANUAL_FILTERING'),
    divergence: build(DIVERGENCE),
    curl: build(CURL),
    vorticity: build(VORTICITY),
    pressure: build(PRESSURE),
    gradientSubtract: build(GRADIENT_SUBTRACT),
    display: build(DISPLAY),
  };

  if (Object.values(programs).some((program) => !program)) {
    return { supported: false, start() {}, stop() {}, destroy() {}, setIntensity() {} };
  }

  /* -- one full-screen triangle pair, reused for every pass ---------------- */

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const blit = (target) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };

  /* -- buffers ------------------------------------------------------------ */

  let dye;
  let velocity;
  let divergence;
  let curl;
  let pressure;

  const resolution = (target) => {
    const ratio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    const aspect = ratio < 1 ? 1 / ratio : ratio;
    const min = Math.round(target);
    const max = Math.round(target * aspect);
    return ratio > 1 ? { width: max, height: min } : { width: min, height: max };
  };

  function initBuffers() {
    const sim = resolution(config.simResolution);
    const dyeRes = resolution(config.dyeResolution);
    const { rgba, rg, r, type } = formats;

    dye = createDoubleFbo(gl, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, type, filtering);
    velocity = createDoubleFbo(gl, sim.width, sim.height, rg.internalFormat, rg.format, type, filtering);
    divergence = createFbo(gl, sim.width, sim.height, r.internalFormat, r.format, type, gl.NEAREST);
    curl = createFbo(gl, sim.width, sim.height, r.internalFormat, r.format, type, gl.NEAREST);
    pressure = createDoubleFbo(gl, sim.width, sim.height, r.internalFormat, r.format, type, gl.NEAREST);
  }

  initBuffers();

  /* -- pointer ------------------------------------------------------------ */

  const pointer = {
    down: false,
    moved: false,
    x: 0.5,
    y: 0.5,
    dx: 0,
    dy: 0,
    color: { r: 0.2, g: 0.1, b: 0.3 },
  };

  const randomColor = () => {
    const hue = config.hueStart + Math.random() * config.hueRange;
    const { r, g, b } = hsvToRgb(hue % 1, 1, 1);
    // A splat adds to whatever dye is already there, so each one is faint and
    // it is the overlap along a stroke that builds up the visible trail.
    return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
  };

  function splat(x, y, dx, dy, color) {
    const aspect = canvas.width / canvas.height;

    gl.useProgram(programs.splat.program);
    gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(programs.splat.uniforms.uAspectRatio, aspect);
    gl.uniform2f(programs.splat.uniforms.uPoint, x, y);
    gl.uniform3f(programs.splat.uniforms.uColor, dx, dy, 0);
    gl.uniform1f(
      programs.splat.uniforms.uRadius,
      correctRadius(config.splatRadius / 100, aspect),
    );
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(programs.splat.uniforms.uColor, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(radius, aspect) {
    return aspect > 1 ? radius * aspect : radius;
  }

  /* -- simulation step ---------------------------------------------------- */

  function step(dt) {
    gl.disable(gl.BLEND);

    // Curl, then vorticity confinement to restore the small eddies.
    gl.useProgram(programs.curl.program);
    gl.uniform2f(programs.curl.uniforms.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    gl.useProgram(programs.vorticity.program);
    gl.uniform2f(programs.vorticity.uniforms.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(programs.vorticity.uniforms.uCurlStrength, config.curl);
    gl.uniform1f(programs.vorticity.uniforms.uDt, dt);
    blit(velocity.write);
    velocity.swap();

    // Project the velocity field back to divergence-free.
    gl.useProgram(programs.divergence.program);
    gl.uniform2f(programs.divergence.uniforms.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    gl.useProgram(programs.clear.program);
    gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(programs.clear.uniforms.uValue, config.pressure);
    blit(pressure.write);
    pressure.swap();

    gl.useProgram(programs.pressure.program);
    gl.uniform2f(programs.pressure.uniforms.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.pressureIterations; i += 1) {
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gl.useProgram(programs.gradientSubtract.program);
    gl.uniform2f(
      programs.gradientSubtract.uniforms.uTexelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // Carry the velocity field, then the dye, along that field.
    gl.useProgram(programs.advection.program);
    gl.uniform2f(programs.advection.uniforms.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!formats.linearFiltering) {
      gl.uniform2f(
        programs.advection.uniforms.uDyeTexelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
    }
    const velocityId = velocity.read.attach(0);
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocityId);
    gl.uniform1i(programs.advection.uniforms.uSource, velocityId);
    gl.uniform1f(programs.advection.uniforms.uDt, dt);
    gl.uniform1f(programs.advection.uniforms.uDissipation, config.velocityDissipation);
    blit(velocity.write);
    velocity.swap();

    if (!formats.linearFiltering) {
      gl.uniform2f(programs.advection.uniforms.uDyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    }
    gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(programs.advection.uniforms.uDissipation, config.densityDissipation);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    // Clear first. The browser wipes the drawing buffer after compositing when
    // preserveDrawingBuffer is false, but relying on that makes the result
    // depend on when we happen to draw — two draws in one frame would blend
    // onto each other and clip to white.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(programs.display.program);
    // The shading pass samples its neighbours, so it needs the dye's texel size
    // rather than the simulation's.
    gl.uniform2f(programs.display.uniforms.uTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
    gl.uniform1f(programs.display.uniforms.uIntensity, config.intensity);
    blit(null);
  }

  /* -- canvas sizing ------------------------------------------------------ */

  function resize() {
    // Cap the device pixel ratio: this is a full-screen fragment shader and a
    // 3x retina buffer costs nine times the fill rate for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);

    if (width === 0 || height === 0) return false;
    if (canvas.width === width && canvas.height === height) return false;

    canvas.width = width;
    canvas.height = height;
    initBuffers();
    return true;
  }

  /* -- input -------------------------------------------------------------- */

  let lastX = null;
  let lastY = null;

  const toCanvas = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      // GL's origin is bottom-left; the DOM's is top-left.
      y: 1 - (clientY - rect.top) / rect.height,
    };
  };

  function onPointerMove(event) {
    const { x, y } = toCanvas(event.clientX, event.clientY);

    if (lastX === null) {
      lastX = x;
      lastY = y;
      pointer.color = randomColor();
      return;
    }

    const dx = (x - lastX) * config.splatForce;
    const dy = (y - lastY) * config.splatForce;
    lastX = x;
    lastY = y;

    // Ignore jitter, so an idle hand does not keep pumping in dye.
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

    splat(x, y, dx, dy, pointer.color);
  }

  function onTouchMove(event) {
    for (const touch of event.targetTouches) {
      onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  function onTouchStart(event) {
    lastX = null;
    lastY = null;
    const touch = event.targetTouches[0];
    if (touch) onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  /* -- loop --------------------------------------------------------------- */

  let frame = null;
  let lastTime = 0;
  let running = false;
  let colorTimer = 0;

  function loop(now) {
    if (!running) return;

    // Clamp dt so a backgrounded tab does not resume with one enormous step.
    const dt = Math.min((now - lastTime) / 1000, 1 / 30) || 1 / 60;
    lastTime = now;

    // Roll the trail's hue on a timer, not per splat.
    colorTimer += dt * config.colorUpdateRate;
    if (colorTimer >= 1) {
      colorTimer = 0;
      pointer.color = randomColor();
    }

    resize();
    step(dt);
    render();

    frame = requestAnimationFrame(loop);
  }

  /** A few splats so the canvas is alive before the pointer has moved. */
  function seed(count = 3) {
    for (let i = 0; i < count; i += 1) {
      const color = randomColor();
      // Kept near the middle and gently pushed, so the page opens with a slow
      // curl behind the content rather than splashes in the corners.
      const x = 0.5 + (Math.random() - 0.5) * 0.45;
      const y = 0.55 + (Math.random() - 0.5) * 0.35;
      const dx = 560 * (Math.random() - 0.5);
      const dy = 560 * (Math.random() - 0.5);
      splat(x, y, dx, dy, { r: color.r * 7, g: color.g * 7, b: color.b * 7 });
    }
  }

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      stop();
    } else {
      start();
    }
  };

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  /**
   * A driver reset or a backgrounded GPU can take the context away. Pause
   * cleanly, and rebuild the buffers when the browser hands it back.
   */
  const onContextLost = (event) => {
    event.preventDefault();
    stop();
  };

  const onContextRestored = () => {
    initBuffers();
    seed();
    start();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  resize();
  seed();

  /**
   * Advance and draw a single frame. Used for the reduced-motion path, where a
   * still, seeded wash is a better answer than an empty canvas.
   */
  function renderOnce(dt = 1 / 60) {
    resize();
    step(dt);
    render();
  }

  return {
    supported: true,
    start,
    stop,
    splat,
    seed,
    renderOnce,
    setIntensity(value) {
      config.intensity = value;
    },
    destroy() {
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      Object.values(programs).forEach((program) => gl.deleteProgram(program.program));
      gl.deleteBuffer(quad);
      gl.deleteBuffer(indices);

      // Deliberately not calling WEBGL_lose_context: a canvas only ever gives
      // out one context, so killing it here would leave the next mount of this
      // component — React's second pass in development, or simply navigating
      // home again — holding a dead canvas it can never revive.
    },
  };
}

export default createFluid;

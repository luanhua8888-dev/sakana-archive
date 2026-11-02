"use client";

import { useEffect, useRef } from "react";

const vertex = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

// Depth gradient, light shafts from the surface, caustics, drifting plankton and a
// bioluminescent glow that follows the pointer. Everything is procedural: no textures.
const fragment = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uTime;uniform vec2 uPointer;uniform float uGlow;uniform float uDeep;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float caustic(vec2 uv,float t){
  vec2 p=mod(uv*6.2831,6.2831)-250.;vec2 i=p;float c=1.;
  for(int n=0;n<4;n++){float tt=t*(1.-3.5/float(n+1));
    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/.005),p.y/(cos(i.y+tt)/.005)));}
  c=1.17-pow(c/4.,1.4);return pow(abs(c),8.);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float aspect=uRes.x/uRes.y;vec2 p=vec2(uv.x*aspect,uv.y);
  vec3 col=mix(vec3(.05,.15,.19),vec3(.13,.28,.32),smoothstep(0.,.75,uv.y));
  col=mix(col,vec3(.25,.45,.46),smoothstep(.62,1.,uv.y)*.75);
  col=mix(col,mix(vec3(.008,.025,.035),vec3(.025,.07,.085),uv.y),uDeep);
  vec2 d=p-vec2(.7*aspect,1.3);float ang=atan(d.x,-d.y);
  float rays=noise(vec2(ang*9.,uTime*.12))*.6+noise(vec2(ang*23.,-uTime*.17))*.4;
  rays=smoothstep(.45,1.,rays)*smoothstep(1.7,.2,length(d))*(1.-uDeep);
  col+=vec3(.55,.82,.76)*rays*.2;
  col+=vec3(.62,.92,.86)*caustic(p*.5+vec2(0.,uTime*.01),uTime*.32)*.2*smoothstep(.2,1.,uv.y)*(1.-uDeep);
  vec2 g=p*26.;g.y-=uTime*.35;g.x+=sin(g.y*.25+uTime*.4)*.35;
  vec2 id=floor(g);vec2 f=fract(g)-.5;float h=hash(id);
  float dist=length(f-(vec2(hash(id+3.1),hash(id+7.7))-.5)*.7);
  float plankton=step(.94-uDeep*.05,h)*smoothstep(.07,0.,dist)*(.5+.5*sin(uTime*(1.+h*2.)+h*40.));
  vec2 q=vec2(uPointer.x*aspect,uPointer.y);float glow=exp(-dot(p-q,p-q)*mix(8.,4.,uDeep))*uGlow;
  col+=vec3(.3,.95,.8)*glow*.18;
  col+=mix(vec3(.62,1.,.9),vec3(.35,.8,1.),uDeep)*plankton*(.3+uDeep*.25+glow*2.6);
  col*=mix(.72,1.,smoothstep(1.25,.25,length(uv-vec2(.62,.55))));
  gl_FragColor=vec4(col,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

// A living patch of sea behind the hero. With motion off it paints one still frame;
// without WebGL it stays empty and the section's CSS background shows through.
export function OceanShader({ motion, deep = false, className = "" }: { motion: boolean; deep?: boolean; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const gl = el?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!el || !gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, vertex), fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes"), uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer"), uGlow = gl.getUniformLocation(program, "uGlow");
    gl.uniform1f(gl.getUniformLocation(program, "uDeep"), deep ? 1 : 0);

    // The scene is soft, so rendering below device resolution costs nothing visible.
    const scale = Math.min(devicePixelRatio || 1, 1.5) * 0.6;
    const resize = () => {
      el.width = Math.max(1, Math.round(el.clientWidth * scale));
      el.height = Math.max(1, Math.round(el.clientHeight * scale));
      gl.viewport(0, 0, el.width, el.height);
    };
    const pointer = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5, glow: 0, target: 0 };
    const host = el.parentElement;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      pointer.target = 1;
    };
    const leave = () => { pointer.target = 0; };

    let frame = 0, visible = true, last = performance.now(), time = 8;
    const draw = () => {
      gl.uniform2f(uRes, el.width, el.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uGlow, pointer.glow);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      frame = 0;
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      time += dt;
      const ease = Math.min(1, dt * 4);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.glow += (pointer.target - pointer.glow) * ease;
      draw();
      if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!motion || frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });

    resize();
    draw();
    const resizer = new ResizeObserver(() => { resize(); draw(); });
    resizer.observe(el);
    if (motion) {
      observer.observe(el);
      host?.addEventListener("pointermove", move);
      host?.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", wake);
      wake();
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      host?.removeEventListener("pointermove", move);
      host?.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", wake);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [motion, deep]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}

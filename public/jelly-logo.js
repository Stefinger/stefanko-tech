/* The existing brand outline becomes a softly rounded volume. No external runtime. */
(()=>{
 'use strict';
 let raf=0;
 const canvas=document.createElement('canvas');canvas.className='jelly-volume';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
 const api=window.jellyLogo={ready:false,canvas,introTime:0,idleAt:performance.now(),idlePhase:6.3,mode:'idle',attach(parent){if(parent&&canvas.parentNode!==parent)parent.appendChild(canvas);canvas.classList.toggle('is-fullscreen',parent?.classList.contains('opening'))},intro(ms){this.mode='intro';this.introTime=ms;draw(ms/1000)},prepareLanding(){this.mode='landing';this.attach(document.querySelector('.opening-logo'));draw(6.7)},idle(){this.mode='idle';this.idleAt=performance.now();this.idlePhase=this.introTime?6.7:6.3;start()},pause(){cancelAnimationFrame(raf);raf=0}};
 if(!gl)return;
 const vertex='attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}';
 const glsl=value=>Number(value).toFixed(3);
 const introMass=window.JELLY_MOTION.map(({direction,resting,arrival,radius},i)=>{
  const sphere=`thought(p,vec3(${direction.map(glsl)}),vec3(${resting.map(glsl)}),${glsl(arrival/1000)},${glsl(radius)})`;
  return i?`mass=softUnion(mass,${sphere},.27);`:`float mass=${sphere};`;
 }).join('\n');
 const fragment=`precision highp float;
 uniform vec2 uResolution;uniform float uTime,uIntro,uImpact,uTilt,uViewScale,uBalloon,uCollision;uniform vec2 uBounds;uniform sampler2D uShape;
 float softUnion(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
 mat2 rotate2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
 float mark(vec3 p){
  p.x-=(sin(uTime*.55)*.46+sin(uTime*.27)*.055)*uBalloon;
  p.x/=1.+.16*uBalloon;
  p.xz=rotate2(uTilt+sin(uTime*.6)*.075)*p.xz;
  p.y-=sin(uTime*.72)*.115*uBalloon;
  p.xy=rotate2(-.09+sin(uTime*.45)*mix(.035,.105,uBalloon))*p.xy;
  p.x-=sin(p.y*3.+uTime*1.8)*(.012+uImpact*.07);
  p.y*=1.+sin(uTime*1.25)*.018+uImpact*.06;
  p.x*=1.-uImpact*.08;
  vec2 uv=vec2(p.x,-p.y)/3.+.5;
  vec4 sampleD=texture2D(uShape,clamp(uv,0.,1.));
  float d=(sampleD.r*65280.+sampleD.g*255.)/65535.;
  d=(d-.5)*.8-.04*uBalloon;
  d+=length(max(abs(p.xy)-1.49,0.));
  // Elliptical cross-section: inflated face and taut rounded edges.
  float radius=mix(.16,.245,uBalloon);
  float depth=mix(.065+.08*smoothstep(0.,.3,-d),.045+.13*smoothstep(0.,.25,-d),uBalloon);
  vec2 q=vec2(d+radius,abs(p.z)-depth);
  return min(max(q.x,q.y),0.)+length(max(q,0.))-radius;
 }
 float thought(vec3 p,vec3 direction,vec3 resting,float arrival,float radius){
  direction.xy=direction.xy*uBounds+normalize(direction.xy)*.55;
  float travel=1.-pow(clamp((uTime-arrival+.78)/.78,0.,1.),4.);
  float elapsed=max(0.,uTime-arrival);
  float bounce=sin(elapsed*17.)*exp(-elapsed*2.8);
  float pulse=uCollision*step(arrival,uTime);
  vec3 center=mix(resting,direction,travel)-normalize(direction)*bounce*.38;
  center.xy+=normalize(vec2(-direction.y,direction.x))*sin(elapsed*12.)*exp(-elapsed*2.8)*.13;
  center.xy+=resting.xy*pulse*.24;
  p-=center;
  float wobble=sin(p.x*5.+uTime*3.)*sin(p.y*4.-uTime*2.)*(.035+abs(pulse)*.025);
  float squeeze=bounce*.48+pulse*.14;
  p.x*=1.+squeeze;p.y*=1.-squeeze*.7;
  float growth=1.+.12*(1.-exp(-elapsed*6.));
  return (length(p)-radius*growth+wobble)/(1.+abs(squeeze));
 }
 float scene(vec3 p){
  float letter=mark(p);
  if(uIntro<.5||uTime>6.25)return letter;
  ${introMass}
  return mix(mass,letter,smoothstep(4.35,6.2,uTime));
 }
 void main(){
  vec2 uv=(gl_FragCoord.xy-uResolution*.5)/uResolution.y*2.;
  vec3 ro=vec3(uv*uViewScale,3.3),rd=vec3(0.,0.,-1.);float travel=0.;bool hit=false;
  for(int i=0;i<64;i++){float dist=scene(ro+rd*travel);if(dist<.0025){hit=true;break;}travel+=max(dist*.78,.002);if(travel>5.5)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*travel;float e=.012;
  vec3 n=normalize(vec3(scene(p+vec3(e,0.,0.))-scene(p-vec3(e,0.,0.)),scene(p+vec3(0.,e,0.))-scene(p-vec3(0.,e,0.)),scene(p+vec3(0.,0.,e))-scene(p-vec3(0.,0.,e))));
  vec3 light=normalize(vec3(-.65,.9,1.4));float diff=max(dot(n,light),0.);
  // Wide diffuse lobes and subdued micrograin give opaque, soft-touch silicone.
  float broad=pow(max(dot(n,normalize(vec3(-.4,.9,1.3))),0.),3.);
  float rim=pow(1.-max(dot(n,-rd),0.),3.);
  float grain=fract(sin(dot(p.xy*110.,vec2(12.9898,78.233)))*43758.5453)-.5;
  vec3 base=vec3(1.,.435,.682);
  vec3 color=base*(.42+.55*diff)+vec3(1.,.78,.86)*broad*.055;
  color+=vec3(.10,.022,.052)*rim+grain*.004;
  vec3 halfLight=normalize(light-rd);
  float satin=pow(max(dot(n,halfLight),0.),38.);
  float softbox=pow(max(dot(n,normalize(vec3(-.38,.6,1.8))),0.),95.);
  vec3 latex=base*(.38+.63*diff)+vec3(1.,.86,.93)*(satin*.25+softbox*.35);
  latex+=vec3(.2,.025,.085)*rim;
  color=mix(color,latex,uBalloon);
  gl_FragColor=vec4(clamp(color,0.,1.),1.);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return}catch{return}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['uResolution','uTime','uIntro','uImpact','uTilt','uShape','uViewScale','uBounds','uBalloon','uCollision'].map(k=>[k,gl.getUniformLocation(program,k)]));
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 let last=0,impactTime=-100,tilt=0,targetTilt=0;const started=performance.now();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(t){
  if(!api.ready)return;
  const w=canvas.clientWidth||340,h=canvas.clientHeight||450;
  const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt((api.mode==='intro'?600000:450000)/(w*h)));
  const width=Math.round(w*ratio),height=Math.round(h*ratio);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height)}
  tilt+=(targetTilt-tilt)*.08;
  const elapsed=(performance.now()-impactTime)/1000;
  const mobile=innerWidth<=760,baseView=mobile?1.72:1.7;
  const openingHost=document.querySelector('.opening-logo');
  // Match the final full-screen framing to the landing canvas to avoid a size jump.
  const landingView=Math.max(baseView,1.45/(openingHost.offsetWidth/openingHost.offsetHeight*2.2/1.6));
  const zoom=Math.max(0,Math.min(1,(t-5.7)/1.0));
  const viewScale=api.mode==='intro'?h/(openingHost.offsetHeight*.82)*(1+(landingView/1.952-1)*zoom):Math.max(baseView,1.45*h/w);
  gl.uniform1f(uniforms.uViewScale,viewScale);gl.uniform2f(uniforms.uBounds,viewScale*w/h,viewScale);
  gl.uniform2f(uniforms.uResolution,width,height);gl.uniform1f(uniforms.uTime,reduced.matches?6.3:t);gl.uniform1f(uniforms.uIntro,api.mode==='intro'?1:0);
  gl.uniform1f(uniforms.uBalloon,api.mode==='intro'?Math.max(0,Math.min(1,(t-5.7)/1.0)):1);
  // One shared impact calculation per frame, rather than per ray-march sample.
  const collision=api.mode==='intro'&&!reduced.matches?window.JELLY_MOTION.reduce((sum,{arrival})=>{const age=t-arrival/1000;return age<0?sum:sum+Math.sin(age*17)*Math.exp(-age*2.8)},0):0;
  gl.uniform1f(uniforms.uCollision,collision);
  gl.uniform1f(uniforms.uImpact,reduced.matches?0:Math.sin(elapsed*10)*Math.exp(-elapsed*2));gl.uniform1f(uniforms.uTilt,reduced.matches?0:tilt);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function tick(now){
  raf=0;if(document.hidden||api.mode!=='idle')return;
  const hero=document.querySelector('.hero');const rect=hero.getBoundingClientRect();
  if(rect.bottom>0&&rect.top<innerHeight&&now-last>32){draw(api.idlePhase+(now-api.idleAt)/1000);last=now}
  if(!reduced.matches&&rect.bottom>0&&rect.top<innerHeight)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf&&api.ready&&api.mode==='idle')raf=requestAnimationFrame(tick)}
 const image=new Image();image.onload=()=>{
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(uniforms.uShape,0);
  api.ready=true;document.body.classList.add('volume-ready');api.attach(document.querySelector(api.mode==='intro'?'.opening':api.mode==='landing'?'.opening-logo':'.hero-logo'));start();
 };image.src='/assets/logo-distance.png';
 document.addEventListener('visibilitychange',()=>{if(document.hidden)api.pause();else start()});
 addEventListener('scroll',start,{passive:true});addEventListener('resize',()=>{draw(api.mode==='intro'?api.introTime/1000:api.idlePhase+(performance.now()-api.idleAt)/1000);start()});reduced.addEventListener('change',()=>{api.pause();draw(6.3);start()});
 document.querySelector('.hero-art').addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();targetTilt=((e.clientX-r.left)/r.width-.5)*.3;start()});
 document.querySelector('.hero-art').addEventListener('pointerleave',()=>{targetTilt=0});
 document.querySelector('.hero-art').addEventListener('pointerdown',()=>{impactTime=performance.now();start()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();api.ready=false;api.pause();document.body.classList.remove('volume-ready')});
})();

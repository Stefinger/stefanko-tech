/* ScrollTrigger directs the existing document; native scrolling stays in control. */
(()=>{
 'use strict';
 const gsap=window.gsap,ST=window.ScrollTrigger;
 if(!gsap||!ST)return;
 gsap.registerPlugin(ST);
 ST.config({ignoreMobileResize:true,autoRefreshEvents:'visibilitychange,DOMContentLoaded,load'});
 let context=null,records=[],progress=new Map(),refreshing=false;
 const body=document.body;
 const shells=[...document.querySelectorAll('.connections-section,.proof-section,.contact')].map(section=>{
  const shell=document.createElement('div');shell.className='scene-shell';section.before(shell);shell.appendChild(section);return {shell,stage:section};
 });
 function clear(){
  if(context){context.revert();context=null}
  records.forEach(({shell,stage})=>{shell.style.height='';shell.style.zIndex='';stage.classList.remove('story-pinned');shell.classList.remove('story-scene')});
  records=[];progress.clear();body.classList.remove('scroll-story');
 }
 window.storyDirector={
  clear,
  progress(act){return progress.get(act)},
  rebuild({height,reduced,onUpdate}){
   if(refreshing)return;
   clear();if(reduced)return;
   refreshing=true;body.classList.add('scroll-story');
   const hero=document.querySelector('.hero');
   records=[{shell:hero,stage:hero.querySelector('.hero-stage')},...[...document.querySelectorAll('.act')].map(act=>({shell:act,stage:act.querySelector('.act-stage')})),...shells];
   try{
    context=gsap.context(()=>{
     // Measure readable natural content first. Only then assign intentional scene lengths.
     records.forEach((record,i)=>{
      const {shell,stage}=record;
      const stageHeight=Math.ceil(Math.max(stage.offsetHeight,stage.scrollHeight));
      const act=shell.dataset.act;
      const motion=act==='message'?1.65:act==='questions'?1.1:act==='delivery'?.85:act==='drafts'||act==='prototype'?.35:act==='decisions'?.22:0;
      const hold=motion+.22;
      record.motion=motion;
      record.height=stageHeight;
      shell.classList.add('story-scene');shell.style.zIndex=String(i+1);
      if(i<records.length-1)shell.style.height=stageHeight+height*hold+'px';
     });
     records.forEach(({shell,stage,height:stageHeight,motion},i)=>{
      const next=records[i+1];
      if(next){
       stage.classList.add('story-pinned');
       const taller=stageHeight>height+2;
       ST.create({id:'scene-'+i,trigger:shell,start:()=>taller?`top+=${stageHeight-height} top`:'top top',endTrigger:next.shell,end:'top top',pin:stage,pinSpacing:false,anticipatePin:0,invalidateOnRefresh:true});
       if(shell.dataset.act){
        const state={value:0};progress.set(shell,0);
        const readingOffset=Math.max(0,stageHeight-height);
        const chat=stage.querySelector('.chat-visual');
        const chatLead=chat?Math.max(0,height*.65-(chat.getBoundingClientRect().top-stage.getBoundingClientRect().top)):0;
        gsap.to(state,{value:1,ease:'none',scrollTrigger:{trigger:shell,start:()=>chat?`top ${chatLead}px`:`top+=${readingOffset} top`,end:()=>`top+=${readingOffset+height*Math.max(.01,motion)} top`,scrub:chat?.55:.45},onUpdate:()=>{progress.set(shell,state.value);onUpdate()}});
       }
       // Keep the reading surface still and fully legible while the next panel covers it.
      }
      if(i>0){
       gsap.fromTo(stage,{borderTopLeftRadius:20,borderTopRightRadius:20},{borderTopLeftRadius:0,borderTopRightRadius:0,ease:'none',scrollTrigger:{trigger:shell,start:()=>`top ${height*.8}px`,end:'top top',scrub:.3}});
      }
     });
    });
    ST.refresh();onUpdate();
   }finally{refreshing=false}
  }
 };
})();

"use strict";!function e(t,i,s){function r(l,a){if(!i[l]){if(!t[l]){var n="function"==typeof require&&require;if(!a&&n)return n(l,!0);if(o)return o(l,!0);var h=new Error("Cannot find module '"+l+"'");throw h.code="MODULE_NOT_FOUND",h}var c=i[l]={exports:{}};t[l][0].call(c.exports,function(e){var i=t[l][1][e];return r(i||e)},c,c.exports,e,t,i,s)}return i[l].exports}for(var o="function"==typeof require&&require,l=0;l<s.length;l++)r(s[l]);return r}({1:[function(e,t,i){$(function(){$("#tabs").tabs(),$("#controls-toggle").click(function(){$("#tabs").slideToggle("slow",function(){})}),$("#info-box").hide(),$("#info-toggle").click(function(){$("#info-box").slideToggle("slow",function(){})})})},{}],2:[function(e,t,i){var s=e("./main.js");e("./controls.js");window.addEventListener("load",function(){console.log("window.onload ran");s.init()})},{"./controls.js":1,"./main.js":3}],3:[function(e,t,i){var s={canvas:void 0,ctx:void 0,firstRun:!0,accurate:!1,playBool:!0,audioClick:!0,glitch:!1,frames:100,framesLimit:3,grid:[],temp:[],width:20,height:20,cellSize:25,maxAge:30,bgOpacity:.3,colorRate:6,colorMode:"pulseF",colorVal:null,hueVal:100,satVal:8,brightVal:8,slowCount:0,border:!0,lineW:1,instrument:"gong",sound:!1,shape:"flyer",camera:void 0,scene:void 0,renderer:void 0,geometry:void 0,texture:void 0,mesh:void 0,threeWidth:window.innerWidth,threeHeight:window.innerHeight/2,xSpeed:.02,ySpeed:.01,threeShape:"cube",cameraDist:500,liveCount:0,audCtx:void 0,osc:void 0,conv:void 0,impulses:["studio"],soundFile:void 0,source:void 0,init:function(){console.log("app.main.init() called"),this.canvas=document.querySelector("canvas"),this.ctx=this.canvas.getContext("2d"),this.initThree(),this.controls(),this.audCtx=new AudioContext,this.soundFile=document.querySelector("#audiofile"),this.source=this.audCtx.createMediaElementSource(this.soundFile),this.conv=this.audCtx.createConvolver(),this.source.connect(this.conv),this.conv.connect(this.audCtx.destination),this.firstRun&&(this.gridSetup(),this.firstRun=!1),this.animate(),this.update(),console.log("init ran")},loadImpulse:function(e){var t=this,i=new XMLHttpRequest;i.open("GET","../impulses/"+e+".wav",!0),i.responseType="arraybuffer",i.onload=function(){var e=i.response;console.log(e),t.audCtx.decodeAudioData(e,function(e){t.conv.buffer=e,t.soundFile.play()})},i.send()},initThree:function(){this.renderer=new THREE.WebGLRenderer,this.renderer.setSize(window.innerWidth,window.innerHeight),document.body.appendChild(this.renderer.domElement),this.renderer.domElement.id="threeCan",this.scene=new THREE.Scene,this.camera=new THREE.PerspectiveCamera(70,this.threeWidth/this.threeHeight,1,1e3),this.camera.position.z=this.cameraDist,this.scene.add(this.camera),this.texture=new THREE.Texture(this.canvas),this.addGeometry(),this.canvas.width=this.canvas.height=this.size},animate:function(){this.animationID=requestAnimationFrame(this.animate.bind(this)),this.update(),this.texture.needsUpdate=!0,this.camera.position.z=this.cameraDist,this.mesh.rotation.y+=this.ySpeed,this.mesh.rotation.x+=this.xSpeed,this.renderer.render(this.scene,this.camera)},addGeometry:function(){var e=new THREE.MeshBasicMaterial({map:this.texture});switch(this.threeShape){case"cube":this.geometry=new THREE.BoxGeometry(300,300,300);break;case"torus":this.geometry=new THREE.TorusGeometry(200,100,20,100);break;case"cylinder":this.geometry=new THREE.CylinderGeometry(150,150,100,32);break;case"torusKnot":this.geometry=new THREE.TorusKnotGeometry(150,30,100,16)}this.mesh=new THREE.Mesh(this.geometry,e),this.scene.add(this.mesh)},deleteSceneObjs:function(){for(;this.scene.children.length>0;)this.scene.remove(this.scene.children[0])},gridSetup:function(){this.grid=[],this.temp=[],this.canvas.width=(this.width-2)*this.cellSize,this.canvas.height=(this.height-2)*this.cellSize,this.ctx.fillStyle="black",this.ctx.fillRect(0,0,3e3,3e3);for(var e=0;e<this.height;e++){this.grid[e]=[[]],this.temp[e]=[[]];for(var t=0;t<this.width;t++)this.grid[e][t]=[Math.round(Math.random()),0],this.temp[e][t]=[0,0],0!=t&&0!=e&&t!=this.width-1&&e!=this.height-1||(this.grid[e][t]=0)}},getMousePos:function(e,t){var i=this.canvas.getBoundingClientRect();return{x:Math.floor((t.clientX-i.left)/this.cellSize),y:Math.floor((t.clientY-i.top)/this.cellSize)}},clickEffect:function(e,t){if(this.audioClick){var i=parseFloat(document.getElementById("freq").value),s=parseFloat(document.getElementById("attack").value),r=parseFloat(document.getElementById("decay").value),o=parseFloat(document.getElementById("cm").value),l=parseFloat(document.getElementById("indexV").value);this.grid[t][e][3]=1,this.grid[t][e][4]=i,this.grid[t][e][5]=s,this.grid[t][e][6]=r,this.grid[t][e][7]=o,this.grid[t][e][8]=l}else switch(this.shape){case"flyer":this.grid[t-1][e][0]=1,this.grid[t][e+1][0]=1,this.grid[t+1][e-1][0]=1,this.grid[t+1][e][0]=1,this.grid[t+1][e+1][0]=1;break;case"blinker":this.grid[t][e][0]=1,this.grid[t-1][e][0]=1,this.grid[t+1][e][0]=1}console.log(e+","+t)},controls:function(){var e=this;document.querySelector("canvas").addEventListener("click",function(t){var i=e.getMousePos(this.canvas,t);i.x,i.y;e.clickEffect(i.x,i.y)},!1),document.querySelector("#play").onclick=function(t){e.play()},document.querySelector("#forward").onclick=function(t){e.forward()},document.querySelector("#speed").onchange=function(t){e.framesLimit=t.target.value,document.querySelector("#speedVal").value=t.target.value},document.querySelector("#bgOpacity").onchange=function(t){e.bgOpacity=t.target.value/100,document.querySelector("#opacityVal").value=t.target.value},document.querySelector("#dispMode").onchange=function(t){"aesthetics"==t.target.value?(e.accurate=!1,e.gridSetup()):(e.accurate=!0,e.gridSetup())},document.querySelector("#glitch").onchange=function(t){t.target.checked?e.glitch=!0:e.glitch=!1},document.querySelector("#colorMode").onchange=function(t){e.colorMode=t.target.value},document.querySelector("#hue").onchange=function(t){e.hueVal=t.target.value,document.querySelector("#hueVal").value=t.target.value},document.querySelector("#saturation").onchange=function(t){e.satVal=t.target.value,document.querySelector("#saturationVal").value=t.target.value},document.querySelector("#bright").onchange=function(t){e.brightVal=t.target.value,document.querySelector("#brightVal").value=t.target.value},document.querySelector("#cellSize").onchange=function(t){e.cellSize=t.target.value,e.gridSetup(),document.querySelector("#cellSizeVal").value=t.target.value},document.querySelector("#width").onchange=function(t){e.width=t.target.value,e.gridSetup(),document.querySelector("#widthVal").value=t.target.value},document.querySelector("#height").onchange=function(t){e.height=t.target.value,e.gridSetup(),document.querySelector("#heightVal").value=t.target.value},document.querySelector("#maxAge").onchange=function(t){e.maxAge=t.target.value,document.querySelector("#maxAgeVal").value=t.target.value},document.querySelector("#colorRate").onchange=function(t){e.colorRate=t.target.value,document.querySelector("#colorRateVal").value=t.target.value},document.querySelector("#border").onchange=function(t){0==t.target.value?e.border=!1:(e.border=!0,e.lineW=t.target.value),document.querySelector("#borderVal").value=t.target.value},document.querySelector("#xSpeed").onchange=function(t){e.xSpeed=t.target.value/100,document.querySelector("#xSpeedVal").value=t.target.value},document.querySelector("#ySpeed").onchange=function(t){e.ySpeed=t.target.value/100,document.querySelector("#ySpeedVal").value=t.target.value},document.querySelector("#cameraD").onchange=function(t){e.cameraDist=t.target.value,document.querySelector("#cameraDVal").value=t.target.value},document.querySelector("#threeShape").onchange=function(t){e.deleteSceneObjs(),e.threeShape=t.target.value,e.addGeometry()},document.querySelector("#mute").onchange=function(t){"mute"==t.target.value?e.sound=!1:e.sound=!0}},runAutomata:function(){this.liveCount=0;for(var e=1;e<this.height-1;e++)for(var t=1;t<this.width-1;t++)1==this.grid[e-1][t-1][0]&&this.liveCount++,1==this.grid[e-1][t][0]&&this.liveCount++,1==this.grid[e-1][t+1][0]&&this.liveCount++,1==this.grid[e][t-1][0]&&this.liveCount++,1==this.grid[e][t+1][0]&&this.liveCount++,1==this.grid[e+1][t-1][0]&&this.liveCount++,1==this.grid[e+1][t][0]&&this.liveCount++,1==this.grid[e+1][t+1][0]&&this.liveCount++,1==this.grid[e][t][0]?(1==this.liveCount||0==this.liveCount?(this.temp[e][t][0]=0,this.temp[e][t][1]=0):2==this.liveCount||3==this.liveCount?(this.temp[e][t][0]=1,this.temp[e][t][1]++):(this.temp[e][t][0]=0,this.temp[e][t][1]=0),this.grid[e][t][1]>=this.maxAge&&(this.temp[e][t][0]=0,this.temp[e][t][1]=0,this.loadImpulse(this.impulses[0]))):0==this.grid[e][t][0]&&(3==this.liveCount?(this.temp[e][t][0]=1,this.temp[e][t][1]++):(this.temp[e][t][0]=0,this.temp[e][t][1]=0)),this.liveCount=0,this.grid[e][t][10]=this.grid[e][t][1]*this.colorRate;var i=this.grid;this.grid=this.temp,this.accurate&&(this.temp=i)},draw:function(){this.ctx.fillStyle="rgba(0,0, 0,"+this.bgOpacity+")",this.ctx.fillRect(0,0,this.width*this.cellSize,this.height*this.cellSize),this.ctx.strokeStyle="black",this.ctx.lineWidth=this.lineW;for(var e=0;e<this.height;e++){for(var t=0;t<this.width;t++){switch(this.colorMode){case"pink":this.ctx.fillStyle="hsl( 280, "+3*this.grid[e][t][10]+"%, "+1.2*this.grid[e][t][10]+"%)";break;case"green":this.ctx.fillStyle="hsl(89 ,"+this.grid[e][t][10]+"%, "+.7*this.grid[e][t][10]+"%)";break;case"orange":this.ctx.fillStyle="hsl( 23, "+this.grid[e][t][10]+"%, "+.5*this.grid[e][t][10]+"%)";break;case"B&W":this.ctx.fillStyle="hsl( 0, 0%, "+this.grid[e][t][10]+"%)";break;case"custom":this.ctx.fillStyle="hsl("+this.hueVal+","+this.satVal/30*this.grid[e][t][10]+"%,"+this.brightVal/30*this.grid[e][t][10]+"%)";break;case"rainbow":this.ctx.fillStyle="hsl("+this.hueVal+","+this.satVal/30*this.grid[e][t][10]+"%,"+this.brightVal/30*this.grid[e][t][10]+"%)",this.hueVal++;break;case"pulseF":case"pulseS":this.ctx.fillStyle="hsl("+this.hueVal+","+this.satVal/30*this.grid[e][t][10]+"%,"+this.brightVal/30*this.grid[e][t][10]+"%)"}if(1==this.grid[e][t][0])if(this.grid[e][t][1]==this.maxAge-1?this.ctx.fillStyle="red":1==this.grid[e][t][3]&&(this.ctx.fillStyle="hsl( 124, 100%, 60%)"),this.glitch){if(1==this.getRandomInt(0,1)){var i=this.getRandomInt(0,3),s=this.getRandomInt(1,10);switch(i){case 0:this.ctx.fillRect(t*this.cellSize-s,e*this.cellSize,this.cellSize,this.cellSize);break;case 1:this.ctx.fillRect(t*this.cellSize+s,e*this.cellSize,this.cellSize,this.cellSize);break;case 2:this.ctx.fillRect(t*this.cellSize,e*this.cellSize+s,this.cellSize,this.cellSize);break;case 3:this.ctx.fillRect(t*this.cellSize-s,e*this.cellSize,this.cellSize,this.cellSize)}}}else this.ctx.fillRect((t-1)*this.cellSize,(e-1)*this.cellSize,this.cellSize,this.cellSize),this.border&&this.ctx.strokeRect((t-1)*this.cellSize,(e-1)*this.cellSize,this.cellSize,this.cellSize);else 0==t||0==e||t==this.width-1||this.height}"pulseF"==this.colorMode?this.hueVal++:"pulseS"==this.colorMode&&++this.slowCount>30&&(this.hueVal++,this.slowCount=0)}this.runAutomata()},play:function(){this.playBool?this.playBool=!1:this.playBool=!0,console.log("play")},forward:function(){this.draw()},update:function(){this.playBool?(this.frames>=this.framesLimit&&(this.draw(),this.frames=0),this.frames++):this.playBool},getRandomInt:function(e,t){return Math.floor(Math.random()*(t-e+1)+e)}};t.exports=s},{}]},{},[2]);
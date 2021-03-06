'use strict'
const app = {
  canvas: undefined,
  ctx: undefined,
  firstRun: true,
  accurate: false,
  playBool: true,
  audioClick: true,
  glitch: false,
  frames: 100,
  framesLimit: 3,
  grid: [],
  temp: [],
  width: 20,
  height: 20, //size of each cell in px
  cellSize: 25, //max amount of times a cell can be consecutively alive before dying.
  maxAge: 30, //how fast it changes color (higher : quicker)
  bgOpacity: 0.3,
  colorRate: 6, //color values for bg
  colorMode: "pulseF", //color of cells
  colorVal: null,
  hueVal: 100,
  satVal: 8,
  brightVal: 8,
  slowCount: 0,
  border: true,
  lineW: 1,
  sound: false,
  camera: undefined,
  scene: undefined,
  renderer: undefined,
  geometry: undefined,
  texture: undefined,
  mesh: undefined,
  threeWidth: window.innerWidth,
  threeHeight: window.innerHeight / 2,
  xSpeed: 0.02,
  ySpeed: 0.01,
  threeShape: 'cube',
  cameraDist: 500,
  liveCount: 0, //create an audioCtx
  audCtx: undefined, // create an oscillator
  conv: undefined,
  impulses: ['largeDarkPlate'],
  soundFile: undefined,
  source: undefined,
  init() {
    console.log("app.main.init() called");
    // initialize properties
    this.canvas = document.querySelector('canvas');
    //this.canvas.width = 512;
    //this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    //start 3d
    this.initThree();

    //set up controls
    this.controls();

    //create audio context
    this.audCtx = new AudioContext();
    
    //create media element from audio element in index
    this.soundFile = document.querySelector('#audiofile');
    this.source = this.audCtx.createMediaElementSource(this.soundFile);
    
    //add convolver filter for reverb
    this.conv = this.audCtx.createConvolver();
  
    //connect them together
    this.source.connect(this.conv);
    this.conv.connect(this.audCtx.destination);
    
    //set up grid on first init only
    if (this.firstRun) {
      this.gridSetup();
      this.firstRun = false;
    }

    //this.playNote(880, .01, 1, 1.5307, 1);
    this.animate();
    this.update();

    console.log("init ran");
  },
  loadImpulse( soundFileName ) {
    let thisRef = this;
    let req = new XMLHttpRequest()
    req.open( 'GET', '../impulses/' + soundFileName + '.wav', true )
    req.responseType = 'arraybuffer' 
    
    req.onload = function() {
      let audioData = req.response
      
      thisRef.audCtx.decodeAudioData( audioData,  buffer => {
        thisRef.conv.buffer = buffer
        //thisRef.soundFile.play();
        var clone = thisRef.soundFile.cloneNode();
        
        thisRef.source = thisRef.audCtx.createMediaElementSource(clone);
    
        //add convolver filter for reverb
        //thisRef.conv = thisRef.audCtx.createConvolver();
  
        //connect them together
        thisRef.source.connect(thisRef.conv);
        //thisRef.conv.connect(thisRef.audCtx.destination);
        
        
        clone.play();
      })
    }

    req.send()
  },
  initThree() {

    //Three JS setup
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'threeCan';

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, this.threeWidth / this.threeHeight, 1, 1000);
    this.camera.position.z = this.cameraDist;
    this.scene.add(this.camera);
    this.texture = new THREE.Texture(this.canvas);

    this.addGeometry();

    this.canvas.width = this.canvas.height = this.size;
  },
  animate() {
    this.animationID = requestAnimationFrame(this.animate.bind(this));

    this.update();
    this.texture.needsUpdate = true;
    this.camera.position.z = this.cameraDist;
    this.mesh.rotation.y += this.ySpeed;
    this.mesh.rotation.x += this.xSpeed;
    this.renderer.render(this.scene, this.camera);
  },
  addGeometry() {
    
    var material = new THREE.MeshBasicMaterial({
      map: this.texture
    });
    
    material.light = true;

    switch (this.threeShape) {
      case 'cube':
        this.geometry = new THREE.BoxGeometry(300, 300, 300);
        break;
      case 'torus':
        this.geometry = new THREE.TorusGeometry(200, 100, 20, 100);
        break;
      case 'cylinder':
        this.geometry = new THREE.CylinderGeometry(150, 150, 100, 32);
        break;
      case 'torusKnot':
        this.geometry = new THREE.TorusKnotGeometry(150, 30, 100, 16);
        break;
    }

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.position.set(0, 0 , 0);
    this.scene.add(this.mesh);
  },
  deleteSceneObjs() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  },
  //create grid using default or user modified values
  gridSetup() {
    this.grid = [];
    this.temp = [];
    //create canvas at appropriate size
    this.canvas.width = (this.width - 2) * this.cellSize;
    this.canvas.height = (this.height - 2) * this.cellSize;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 3000, 3000);
    //instantiate spaces in arrays
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [
                []
            ];
      this.temp[y] = [
                []
            ];
      for (let x = 0; x < this.width; x++) {
        //fill with random values
        this.grid[y][x] = [Math.round(Math.random()), 0];
        this.temp[y][x] = [0, 0];
        //create border
        if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          this.grid[y][x] = 0;
        }
      }
    }
  },
  controls() {
    let thisRef = this;
    //Constant controls
    document.querySelector("#play").onclick = function (e) {
      thisRef.play();
    };
    document.querySelector("#forward").onclick = function (e) {
      thisRef.forward();
    };
    //Render options
    document.querySelector("#speed").onchange = function (e) {
      thisRef.framesLimit = e.target.value;
      document.querySelector("#speedVal").value = e.target.value;
    };
    document.querySelector("#bgOpacity").onchange = function (e) {
      thisRef.bgOpacity = e.target.value / 100;
      document.querySelector("#opacityVal").value = e.target.value;
    };
    document.querySelector("#dispMode").onchange = function (e) {
      if (e.target.value == "aesthetics") {
        thisRef.accurate = false;
        thisRef.gridSetup();
      } else {
        thisRef.accurate = true;
        thisRef.gridSetup();
      }
    };
    document.querySelector("#glitch").onchange = function (e) {
      if (e.target.checked) {
        thisRef.glitch = true;
      } else {
        thisRef.glitch = false;
      }
      //console.log(this.glitch);
    };
    //Color options
    document.querySelector("#colorMode").onchange = function (e) {
      thisRef.colorMode = e.target.value;
    };
    document.querySelector("#hue").onchange = function (e) {
      thisRef.hueVal = e.target.value;
      document.querySelector("#hueVal").value = e.target.value;
    };
    document.querySelector("#saturation").onchange = function (e) {
      thisRef.satVal = e.target.value;
      document.querySelector("#saturationVal").value = e.target.value;
    };
    document.querySelector("#bright").onchange = function (e) {
      thisRef.brightVal = e.target.value;
      document.querySelector("#brightVal").value = e.target.value;
    };
    //Grid options
    document.querySelector("#cellSize").onchange = function (e) {
      thisRef.cellSize = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#cellSizeVal").value = e.target.value;
    };
    document.querySelector("#width").onchange = function (e) {
      thisRef.width = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#widthVal").value = e.target.value;
    };
    document.querySelector("#height").onchange = function (e) {
      thisRef.height = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#heightVal").value = e.target.value;
    };
    //Cell options
    document.querySelector("#maxAge").onchange = function (e) {
      thisRef.maxAge = e.target.value;
      document.querySelector("#maxAgeVal").value = e.target.value;
    };
    document.querySelector("#colorRate").onchange = function (e) {
      thisRef.colorRate = e.target.value;
      document.querySelector("#colorRateVal").value = e.target.value;
    };
    document.querySelector("#border").onchange = function (e) {
      if (e.target.value == 0) {
        thisRef.border = false;
      } else {
        thisRef.border = true;
        thisRef.lineW = e.target.value;
      }
      document.querySelector("#borderVal").value = e.target.value;
    };

    document.querySelector("#xSpeed").onchange = function (e) {
      thisRef.xSpeed = e.target.value / 100;
      document.querySelector("#xSpeedVal").value = e.target.value;
    };

    document.querySelector("#ySpeed").onchange = function (e) {
      thisRef.ySpeed = e.target.value / 100;
      document.querySelector("#ySpeedVal").value = e.target.value;
    };

    document.querySelector("#cameraD").onchange = function (e) {
      thisRef.cameraDist = e.target.value;
      document.querySelector("#cameraDVal").value = e.target.value;
    };

    document.querySelector("#threeShape").onchange = function (e) {
      thisRef.deleteSceneObjs();
      thisRef.threeShape = e.target.value;
      thisRef.addGeometry();
    };

    document.querySelector("#mute").onchange = function (e) {
      if (e.target.value == "mute") {
        thisRef.sound = false;
      } else {
        thisRef.sound = true;
      }
    };
  },
  runAutomata() {
    // loop through every cell
    // look at cell neighbors and count live ones
    // determine next cell state based on neighbor count
    // set temp [y][x] -> new cell state
    this.liveCount = 0;
    //loop through and count live neighbors
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.grid[y - 1][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y - 1][x][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y - 1][x + 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y][x + 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x + 1][0] == 1) {
          this.liveCount++;
        }
        //update temp
        if (this.grid[y][x][0] == 1) {
          if (this.liveCount == 1 || this.liveCount == 0) {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
            //playNote(333, .01, .5, 2.5307, 1);
          } else if (this.liveCount == 2 || this.liveCount == 3) {
            this.temp[y][x][0] = 1;
            this.temp[y][x][1]++;
          } else {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
          }
          if (this.grid[y][x][1] >= this.maxAge) {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
            if (this.sound) {
              this.loadImpulse(this.impulses[0]);
            }
          }
        } else if (this.grid[y][x][0] == 0) {
          if (this.liveCount == 3) {
            this.temp[y][x][0] = 1;
            this.temp[y][x][1]++;
          } else {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
          }
        }
        this.liveCount = 0;
        this.grid[y][x][10] = (this.grid[y][x][1] * this.colorRate);
      }
    }
    // after for loop swap grid and temp arrays
    let swap = this.grid;
    this.grid = this.temp;
    //swap if conway rules is selected by user
    if (this.accurate) {
      this.temp = swap;
    }
  },
  draw() {
    //BG color, alpha is important
    this.ctx.fillStyle = 'rgba(0,0, 0,' + this.bgOpacity + ')';
    this.ctx.fillRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
    //this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = this.lineW;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        //determine color intensity of cell based on its age
        //change fillStyle based on color mode selected
        switch (this.colorMode) {
          case "pink":
            this.ctx.fillStyle = 'hsl( 280, ' + this.grid[y][x][10] * 3 + "%, " + this.grid[y][x][10] * 1.2 + '%)';
            break;
          case "green":
            this.ctx.fillStyle = 'hsl(89 ,' + this.grid[y][x][10] + "%, " + this.grid[y][x][10] * 0.7 + '%)';
            break;
          case "orange":
            this.ctx.fillStyle = 'hsl( 23, ' + this.grid[y][x][10] + "%, " + this.grid[y][x][10] * 0.5 + '%)';
            break;
          case "B&W":
            this.ctx.fillStyle = 'hsl( 0, 0%, ' + this.grid[y][x][10] + '%)';
            break;
          case "custom":
            this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' + (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
            break;
          case "rainbow":
            this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' + (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
            this.hueVal++;
            break;
          case "pulseF":
          case "pulseS":
            this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' + (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
            break;
        }
        if (this.grid[y][x][0] == 1) {
          if (this.grid[y][x][1] == this.maxAge - 1) {
            this.ctx.fillStyle = "red";
          } else if (this.grid[y][x][3] == 1) {
            this.ctx.fillStyle = 'hsl( 124, 100%, 60%)';
            //console.log(this.grid[y][x]);
          }
          if (this.glitch) {
            if (this.getRandomInt(0, 1) == 1) {
              let dir = this.getRandomInt(0, 3);
              let moveAmt = this.getRandomInt(1, 10);
              switch (dir) {
                case 0:
                  this.ctx.fillRect((x * this.cellSize) - moveAmt, y * this.cellSize, this.cellSize, this.cellSize);
                  break;
                case 1:
                  this.ctx.fillRect((x * this.cellSize) + moveAmt, y * this.cellSize, this.cellSize, this.cellSize);
                  break;
                case 2:
                  this.ctx.fillRect(x * this.cellSize, (y * this.cellSize) + moveAmt, this.cellSize, this.cellSize);
                  break;
                case 3:
                  this.ctx.fillRect((x * this.cellSize) - moveAmt, y * this.cellSize, this.cellSize, this.cellSize);
                  break;
              }
            }
            //console.log('glitch ran');
          } else {
            //fill and stroke rects
            this.ctx.fillRect((x - 1) * this.cellSize, (y - 1) * this.cellSize, this.cellSize, this.cellSize);
            if (this.border) {
              this.ctx.strokeRect((x - 1) * this.cellSize, (y - 1) * this.cellSize, this.cellSize, this.cellSize);
            }
          }
        }
        //make border
        else if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          //this.ctx.fillStyle = "black";
          //this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
      if (this.colorMode == 'pulseF') {
        this.hueVal++;
      } else if (this.colorMode == 'pulseS') {
        this.slowCount++;
        if (this.slowCount > 30) {
          this.hueVal++;
          this.slowCount = 0;
        }
      }
    }
    //run round of cell calculations
    this.runAutomata();
  },
  play() {
    if (this.playBool) {
      this.playBool = false;
    } else {
      this.playBool = true;
    }
    console.log("play");
  },
  forward() {
    this.draw();
  },
  update() {
    //this.animationID = requestAnimationFrame(this.update.bind(this));
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //only draw once threshold is passed
    if (this.playBool) {
      if (this.frames >= this.framesLimit) {
        this.draw();
        this.frames = 0;
      }
      this.frames++;
    } else if (!this.playBool) {}
    //stop tracking fps
    //window.requestAnimationFrame(update);
  },
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
module.exports = app;

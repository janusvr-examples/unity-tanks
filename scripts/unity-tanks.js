/* Oh god, don't look at this code.  This is a horrible mess of hacks for this specific demo - the real version is much cleaner ;) */

elation.component.add('engine.things.emulator_win311', function() {
  this.postinit = function() {
      this.loaded = false;
      var xhr = new XMLHttpRequest();
      var mame = false;
      var code;
      var canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;

      this.texture = new THREE.Texture(canvas);
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.canvas = canvas;
setTimeout(elation.bind(this, function() {
      var gameInstance = UnityLoader.instantiate("gameContainer", "systems/unity/Tanks/Build/tanks.json", {onProgress: UnityProgress});

      // Prepare BIOS image
      this.ctx = canvas.getContext('2d');
      var img = new Image();
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0, img.width, img.height);
        this.texture.needsUpdate = true;
console.log('GOT IMAGE', img);
      }.bind(this);
      img.src = 'systems/ibmpc/dosbox-bios.png';

      // FIXME - hack for buggy deferred pointerlock handling in emscripten
      this.playerfree = true;
setTimeout(elation.bind(this, function() {
      var canvas = document.getElementById('#canvas');
console.log('I GOT CANVAS', canvas);
      this.canvas = canvas;
      this.texture = new THREE.Texture(canvas);
      this.texture.needsUpdate = true;
      this.material.map = this.texture;

      canvas._requestPointerLock = canvas.requestPointerLock;
      canvas.requestPointerLock = elation.bind(this, function() {
        if (!this.playerfree) {
          canvas._requestPointerLock();
          this.playerfree = false;
        } 
      });
  
}), 0);
    }), 10000);
  }
  this.createObject3D = function() {
    //var geo = new THREE.BoxGeometry(1,1,.01);
    var janusobj = room.createObject('Object', {id: 'screen', lighting: false, collision_id: 'cube', collision_scale: V(.85,.65,.1), collision_pos: V(-0.5,1.84,2.6)});

    elation.events.add(janusobj._target, 'click', elation.bind(this, this.handleClick));
    elation.events.add(janusobj._target, 'mouseover', elation.bind(this, this.handleMouseover));
    elation.events.add(janusobj._target, 'mouseout', elation.bind(this, this.handleMouseout));
    this.material = new THREE.MeshBasicMaterial({color: 0xffffff, map: this.texture, emissive: 0xffffff});
    var obj = janusobj._target;

    this.button = room.createObject('Object', {id: 'plane', image_id: 'button_loading', lighting: false, pos: V(-0.5, 1.626, 2.56), scale: V(.2, .05, .001), xdir: V(1,0,0), zdir: V(0,0,1) });

    return obj.objects['3d'];
    //return new THREE.Mesh(geo, this.material);
  }
  this.updateFrame = function() {
    if (!this.mesh) {
      var mesh;
      this.objects['3d'].traverse(function(n) {
        if (n instanceof THREE.Mesh) mesh = n;
      });
      if (mesh) {
        mesh.material = this.material;
        this.mesh = mesh;
      }
    }
    if (this.mesh) {
      if (this.mesh.material !== this.material) this.mesh.material = this.material;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.needsUpdate = true;
    }

    var player = this.engine.client.player,
        controls = this.engine.systems.controls;

    if (document.pointerLockElement === this.canvas && this.playeractive) {
      this.playeractive = false;
console.log('deactivate', this.playeractive, this.playerfree);
      controls.deactivateContext('player');
      player.controlstate._reset();
      this.button.image_id = 'button_esc';
      this.button._target.assignTextures();
      setTimeout(elation.bind(this, function() { this.button.visible = false; }), 2500);
      this.material.color.setHex(0xffffff);
      //this.engine.client.player.disable();
    } else if (document.pointerLockElement !== this.canvas && !this.playeractive) {
console.log('activate', this.playeractive, this);
      this.playeractive = true;
      controls.activateContext('player');
      player.controlstate._reset();
      this.button.image_id = (this.loaded ? 'button' : 'button_loading');
      this.playerfree = true;
      this.button.visible = false;
      this.engine.client.hideMenu();
      this.engine.client.player.enable();
    }
  }
  this.handleClick = function(ev) {
    if (this.playeractive && ev.data.distance < 3) {
      this.playerfree = false;
      this.canvas._requestPointerLock();
    }
  }
  this.handleMouseover = function(ev) {
    console.log(ev.data);
    if (this.playeractive && ev.data.distance < 3) {
      this.material.color.setHex(0xffffff);
      this.button.visible = true;
      this.button._target.assignTextures();
      this.button.xdir = V(-0.9987222504440676, 0, -0.05053579392803971);
      this.button.zdir = V(0.05053579184742262, 0, -0.9987222505493476);
    }
  }
  this.handleMouseout = function() {
    if (this.playeractive) {
      this.material.color.setHex(0xcccccc);
    }
    this.button.visible = false;
  }
}, elation.engine.things.janusbase);

var emulator;
room.onLoad = function() {
  var target = room._target;
  emulator = target.spawn('emulator_win311', null, { });
}
room.update = function() {
  if (emulator) {
    emulator.updateFrame();
  }
}

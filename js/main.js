// Set up the scene, camera, and renderer as global variables.
var baseBoneRotation = ( new THREE.Quaternion ).setFromEuler( new THREE.Euler( 0, 0, Math.PI / 2 ) );
var armMeshes = [];
var boneMeshes = [];

var stats, scene, camera, renderer;
var N = 100;
var cells = new Array();
var time = parseInt(0);
var scale_1 = [65.406, 77.72, 87.307, 97.999, 58.270];
var scale_2 = [65.406, 73.416, 77.782, 87.307, 97.999, 110.000, 61.735];
var scale = scale_1;
var scale_length = scale.length;
var isConway = true;
var isMajorScale = true;

var agents = new Array();
var colsOn = new Array();
var rowsOn = new Array();

var sound = new Wad({
    source : 'square', 
    env : {
        attack : .01, 
        decay : .005, 
        sustain : .2, 
        hold : .015, 
        release : .3
    },
    filter : {
        type : 'lowpass',
        frequency : 1200,
        q : 8.5, 
        env : {
            attack : .2,
            frequency : 440
        }
    }
});

window.onload = function() {
   init();
   animate();
  
   // $("#conway").toggleClass("selected_mode", isConway);
   // $("#interactive").toggleClass("selected_mode", !isConway);
}


function updateAgents() {
  var pos = 0;
  var X = 0;
  var Y = 0;

  for (var i = 0; i < agents.length; i++) {
    if (agents[i].direction == 0) {
      Y = agents[i].pos_y;
      var temp = agents[i].pos_x;
      cells[Y*N + temp].alive = 0;
      if (temp == N-1) {
        colsOn.push(Y);
        sound.play({ pitch : scale[Y % scale_length]  * 2^(Y%3)});
      }
      pos = (temp + 1) % N;
      agents[i].pos_x = pos;
      cells[Y*N + pos].alive += 1;
    } else {
      X = agents[i].pos_x;
      var temp = agents[i].pos_y;
      cells[temp*N + X].alive = 0;
      if (temp == N-1) {
        rowsOn.push(X);
        sound.play({ pitch : scale[X % scale_length]  * 2^(X%3)});
      }
      pos = (temp + 1) % N;
      agents[i].pos_y = pos;
      cells[pos*N + X].alive += 1;
    }
  }
}

function addAgent(dim, x, y) {
  var agent = new Agent();
  agent.pos_x = x;
  agent.pos_y = y;
  agent.direction = dim;
  agents.push(agent);
}

function addRandomAgent(dim) {
  var agent = new Agent();
  agent.pos_x = parseInt((Math.random() * (N-1)).toFixed());
  agent.pos_y = parseInt((Math.random() * (N-1)).toFixed());
  agent.direction = dim;
  agents.push(agent);
  $("#total_agents").text("Total Agents: " + agents.length);
}

function updateCells() {

    var count = parseInt(0);

    // MIDDLE ROW
    count += cells[1];
    // LOWER ROW
    count += cells[N];
    count += cells[N + 1];
    // ASSIGN
    cells[0].neighbors = count;

    for (var j = 1; j < N-1; j++) {
      count = 0;

      // MIDDLE ROW
      count += cells[j-1];
      count += cells[j+1];
      // LOWER ROW
      count += cells[N + j-1];
      count += cells[N + j];
      count += cells[N + j+1];
      // ASSIGN
      cells[N + j].neighbors = count;  
    }

  count = 0;
  // MIDDLE ROW
  count += cells[N-2];
  // LOWER ROW
  count += cells[N + N-2];
  count += cells[N + N-1];
  // ASSIGN
  cells[N-1].neighbors = count;

  for (var i = 1; i < N-1; i++) {

    // UPPER ROW
    count += cells[(i-1)*N].alive;
    count += cells[(i-1)*N + 1].alive;
    // MIDDLE ROW
    count += cells[i*N + 1].alive;
    // LOWER ROW
    count += cells[(i+1)*N].alive;
    count += cells[(i+1)*N + 1].alive;
    // ASSIGN
    cells[i*N].neighbors = count;

    for (var j = 1; j < N-1; j++) {
      count = Math.floor(0);

      // UPPER ROW
      count += cells[(i-1)*N + j-1].alive;
      count += cells[(i-1)*N + j].alive;
      count += cells[(i-1)*N + j+1].alive;
      // MIDDLE ROW
      count += cells[i*N + j-1].alive;
      count += cells[i*N + j+1].alive;
      // LOWER ROW
      count += cells[(i+1)*N + j-1].alive;
      count += cells[(i+1)*N + j].alive;
      count += cells[(i+1)*N + j+1].alive;
      // ASSIGN
      cells[i*N + j].neighbors = count;  
    }

    count = 0;
    // UPPER ROW
    count += cells[(i-1)*N + j-1].alive;
    count += cells[(i-1)*N + j].alive;
    // MIDDLE ROW
    count += cells[i*N + j-1].alive;
    // LOWER ROW
    count += cells[(i+1)*N + j-1].alive;
    count += cells[(i+1)*N + j].alive;
    cells[i*N + (N-1)].neighbors = count;
  }

  // UPPER ROW
  count += cells[(N-2)*N];
  count += cells[(N-2)*N + 1];
  // MIDDLE ROW
  count += cells[(N-1)*N + 1];
  // ASSIGN
  cells[(N-1)*N].neighbors = count;

  for (var j = 1; j < N-1; j++) {
    count = 0;

    // UPPER ROW
    count += cells[(N-2)*N + j-1];
    count += cells[(N-2)*N + j];
    count += cells[(N-2)*N + j+1];
    // MIDDLE ROW
    count += cells[(N-1)*N + j-1];
    count += cells[(N-1)*N + j+1];
    // ASSIGN
    cells[(N-1)*N + j].neighbors = count;  
  }

  count = 0;
  // UPPER ROW
  count += cells[(N-2)*N + (N-2)];
  count += cells[(N-2)*N + (N-1)];
  // MIDDLE ROW
  count += cells[(N-1)*N + (N-2)];
  // ASSIGN
  cells[(N-1)*N + (N-1)].neighbors = count;

  // Set state
  for (var i = 0; i < N*N; i++) {
    if ((cells[i].neighbors == 3) || (cells[i].alive && cells[i].neighbors == 2)) {
      cells[i].alive = parseInt(1);
      cells[i].life++;
      if (cells[i].life % 12 == 0) {
        sound.play({ pitch : scale[i % scale_length]  * 2^(i%3)});
      } 
    } else {
      cells[i].alive = parseInt(0);
      cells[i].life = parseInt(0);
    }
  }
}

// Sets up the scene.
function init() {

  // Create the scene and set the scene size.
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // Create a renderer and add it to the DOM.
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  // Create a camera, zoom it out from the model a bit, and add it to the scene.
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 5000 );
 
  if (isConway) {
    camera.position.set( 0, 110, 65);
  } else {
    camera.position.set(0, 60, 36);
  }

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.autoRotate = true;
  controls.maxDistance = 1000;

  // Create an event listener that resizes the renderer with the browser window.
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  stats = new Stats();

  // Set the background color of the scene.
  renderer.setClearColor(0xFFFFFF, 1);

  // Create a light, set its position, and add it to the scene.

    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.position.set( 0, 500, 0 );
    scene.add( hemiLight );
    
  
  if (isConway) {
    if (N < 2) {
      N = 2;
    }
    var len = N * N;
    for (var i = 0; i < len; i++) {
      cells[i] = new Cell();
      var ran = Math.random(0.3, 1.0).toFixed();
      cells[i].alive = parseInt(ran);
      //console.log(cells[i].alive);
    }
  } else {
    if (N < 2) {
        N = 2;
      }
      var len = N * N;
      for (var i = 0; i < len; i++) {
        cells[i] = new Cell();
        cells[i].alive = 0;
      }
  }

  // Add box mesh per child
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      var geometry = new THREE.CubeGeometry(1, 1, 1);

      geometry.dynamic = true;
      // changes to the vertices
      geometry.verticesNeedUpdate = true;
      // changes to the normals
      geometry.normalsNeedUpdate = true;
      var material = new THREE.MeshLambertMaterial({color: 0x0000CC, transparent: true});
      //var material = new THREE.MeshBasicMaterial( { map: texture } );
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * 2 - N;
      mesh.position.y = 0;
      mesh.position.z = j * 2 - N;
      scene.add(mesh);
    }
  }

  var geometry = new THREE.BoxGeometry( 300, 20, 300 );
  var material = new THREE.MeshNormalMaterial();
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( 0, -10, 0 );
  scene.add( mesh );

}

  // Renders the scene and updates the render as needed.
function animate() {

    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    requestAnimationFrame(animate);
  
    if (time % 20 == 0) {
      time = 1;
      if (isConway) {
        updateCells();
      } else {
        updateAgents();
      }
    }

    time++;

    for (var i = 0; i < N*N; i++) {
      if (cells[i].alive == 0) {
          scene.children[1 + i].visible = false;
      } else {
          scene.children[1 + i].visible = true;
          var hue = (parseInt(cells[i].life) % 17) * 0.1;
          //console.log(hue);
          scene.children[1 + i].material.color.setHSL(1-hue, 1.0, 0.5);
          scene.children[1 + i].material.opacity = 0.5;
          scene.children[1 + i].scale.set(1, 1 + hue * 15, 1);
      }
    }

    if (!isConway) {
      for (var i = 0; i < colsOn.length; i++) {
        for (var j = 0; j < N; j++) {
          scene.children[2 + colsOn[i]*N + j].visible = true; 
        }
      }
      for (var i = 0; i < colsOn.length; i++) {
        colsOn.pop();
      }

      for (var i = 0; i < rowsOn.length; i++) {
        for (var j = 0; j < N; j++) {
          scene.children[2 + j*N + rowsOn[i]].visible = true; 
        }
      }
      for (var i = 0; i < rowsOn.length; i++) {
        rowsOn.pop();
      }
    }

     // Render the scene.
    controls.update();

    renderer.render(scene, camera);

}


function toggleMode() {
  console.log("toggled");
  isConway = !isConway;
  if (isConway) {
     $("#conway").addClass("selected_mode");
     $("#interactive").removeClass("selected_mode");
      $("#conway_rules").css("display", "block"); 
      $("#interactive_rules").css("display", "none");
      N = 100;
      var dynamic_canvas = $('canvas');
      if(dynamic_canvas) dynamic_canvas.remove();
      init();
  } else {
    N = 12;
    agents = new Array();
    $("#interactive").addClass("selected_mode");
    $("#conway").removeClass("selected_mode");
    $("#conway_rules").css("display", "none");
    $("#interactive_rules").css("display", "block");
    var dynamic_canvas = $('canvas');
    if(dynamic_canvas) dynamic_canvas.remove();
    init();
    $("#total_agents").text("Total Agents: " + agents.length);
  }
 
}

function toggleScale() {
  isMajorScale = !isMajorScale;
  if (isMajorScale) {
    $("#major_scale").addClass("selected_mode");
    $("#harmonic_minor").removeClass("selected_mode");
    scale = scale_1;
  } else {
    $("#harmonic_minor").addClass("selected_mode");
    $("#major_scale").removeClass("selected_mode");
    scale = scale_2;
  }
}



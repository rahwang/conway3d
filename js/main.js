
// Set up the scene, camera, and renderer as global variables.
var scene, camera, renderer;
var N = 30;
var cells = new Array();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var clock = new THREE.Clock();
var time = 0;

window.onload = function() {
  init();
  animate();
}

// Sets up the scene.
function init() {

  // Create the scene and set the scene size.
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
        scene.fog.color.setHSL( 0.6, 0, 1 );
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // Create a renderer and add it to the DOM.
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  // Create a camera, zoom it out from the model a bit, and add it to the scene.
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(0,0,100);
  scene.add(camera);

  // Create an event listener that resizes the renderer with the browser window.
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  // Set the background color of the scene.
  renderer.setClearColor(0x333F47, 1);

  var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
  // Create a light, set its position, and add it to the scene.
  var light = new THREE.PointLight(0xffffff);
      light.position.set(-100,200,100);
      scene.add(light);


  // Initialize cell grid

  var len = N * N;
  for (var i = 0; i < len; i++) {
    cells[i] = new Cell();
    var ran = Math.random().toFixed();
    cells[i].alive = parseInt(ran);
  }

  // Add box mesh per child
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      var geometry = new THREE.SphereGeometry(0.8, 20, 20);

      geometry.dynamic = true;
      // changes to the vertices
      geometry.verticesNeedUpdate = true;
      // changes to the normals
      geometry.normalsNeedUpdate = true;
      var material = new THREE.MeshLambertMaterial({color: 0xDDDDDD});
      //var material = new THREE.MeshBasicMaterial( { map: texture } );
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * 2 - N;
      mesh.position.y = j * 2 - N;
      mesh.position.z = 0;
      scene.add(mesh);
    }
  }

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  projector = new THREE.Projector();

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
    } else {
      cells[i].alive = parseInt(0);
    }
  }
}


// Renders the scene and updates the render as needed.
function animate() {

  // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  requestAnimationFrame(animate);
   
  if (time % 50 == 0) {
        time = 1;
        updateCells();
      }
  time++;
  for (var i = 0; i < N*N; i++) {
        if (cells[i].alive == 0) {
            scene.children[2 + i].visible = false;
        } else {
            scene.children[2 + i].visible = true;
        }
      }

  // Render the scene.
  controls.update();
  renderer.render(scene, camera);

}

function mouseRayCast() {
 
  // find intersections

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object && intersects[0].object.name != "ground") {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xffff00 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }
}

function onMouseClick( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
 mouseRayCast();
}

window.addEventListener( 'mouseclick', onMouseClick, false );

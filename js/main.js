// Set up the scene, camera, and renderer as global variables.
var scene, camera, renderer;
var N = 10;
var cells = new Array();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var clock = new THREE.Clock();
var light1, light2, light3, light4;

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
  camera.position.set(0,0,40);
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
  light1 = new THREE.PointLight( 0xff0040, 2, 50 );
  light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
  scene.add( light1 );

  light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
  light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
  scene.add( light2 );

  light3 = new THREE.PointLight( 0x80ff80, 2, 50 );
  light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
  scene.add( light3 );

  light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
  light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
  scene.add( light4 );


  // Initialize cell grid

  var len = N * N;
  for (var i = 0; i < len; i++) {
    cells[i] = new Cell();
    var ran = Math.random().toFixed();
    cells[i].alive = ran;
  }

  // Add box mesh per child
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      var geometry = new THREE.SphereGeometry(1, 20, 20);

      geometry.dynamic = true;
      // changes to the vertices
      geometry.verticesNeedUpdate = true;
      // changes to the normals
      geometry.normalsNeedUpdate = true;
      var material = new THREE.MeshLambertMaterial({color: 0xDDDDDD});
      //var material = new THREE.MeshBasicMaterial( { map: texture } );
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * 2 - N/2.0;
      mesh.position.y = j * 2 - N/2.0;
      mesh.position.z = 0;
      scene.add(mesh);
    }
  }

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  projector = new THREE.Projector();

}


// Renders the scene and updates the render as needed.
function animate() {

  // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  requestAnimationFrame(animate);


  for (var i = 0; i < N*N; i++) {
    if (cells[i].alive == 0) {
        scene.children[2 + i].visible = false;
      } else {
        scene.children[2 + i].visible = true;
      }
  }

  var time = Date.now() * 0.0005;
        var delta = clock.getDelta();

        // if( object ) object.rotation.y -= 0.5 * delta;

        light1.position.x = Math.sin( time * 0.7 ) * 30;
        light1.position.y = Math.cos( time * 0.5 ) * 40;
        light1.position.z = Math.cos( time * 0.3 ) * 30;

        light2.position.x = Math.cos( time * 0.3 ) * 30;
        light2.position.y = Math.sin( time * 0.5 ) * 40;
        light2.position.z = Math.sin( time * 0.7 ) * 30;

        light3.position.x = Math.sin( time * 0.7 ) * 30;
        light3.position.y = Math.cos( time * 0.3 ) * 40;
        light3.position.z = Math.sin( time * 0.5 ) * 30;

        light4.position.x = Math.sin( time * 0.3 ) * 30;
        light4.position.y = Math.cos( time * 0.7 ) * 40;
        light4.position.z = Math.sin( time * 0.5 ) * 30;


  // Render the scene.
  mouseRayCast();
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

function onMouseMove( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   

}

window.addEventListener( 'mousemove', onMouseMove, false );

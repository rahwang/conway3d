 // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer;
    var N = 10;
    var cells = new Array();


    init();
    animate();

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
      camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
      camera.position.set(0,6,200);
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
      //renderer.setClearColorHex(0x333F47, 1);

      // Create a light, set its position, and add it to the scene.
      var light = new THREE.PointLight(0xffffff);
      light.position.set(-100,200,100);
      scene.add(light);

      // Load in the mesh and add it to the scene.
      //var loader = new THREE.JSONLoader();
      //loader.load( "models/treehouse_logo.js", function(geometry){
      //  var material = new THREE.MeshLambertMaterial({color: 0x55B663});
      //  mesh = new THREE.Mesh(geometry, material);
      //  scene.add(mesh);
      //});

      // Initialize cell grid

      var len = N * N;
      for (var i = 0; i < len; i++) {
        cells[i] = new Cell();
        var ran = Math.random().toFixed();
        cells[i].alive = ran;
        console.log(cells[i].alive);
      }

      // Add box mesh per child
      for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
          var geometry = new THREE.BoxGeometry(1, 1, 1);

          geometry.dynamic = true;
          // changes to the vertices
          geometry.verticesNeedUpdate = true;
          // changes to the normals
          geometry.normalsNeedUpdate = true;
          var material = new THREE.MeshLambertMaterial({color: 0xCC0000});
          //var material = new THREE.MeshBasicMaterial( { map: texture } );
          mesh = new THREE.Mesh(geometry, material);
          mesh.position.x = i * 2;
          mesh.position.y = j * 2;
          mesh.position.z = 0;
          scene.add(mesh);
        }
      }

      // Add OrbitControls so that we can pan around with the mouse.
      controls = new THREE.OrbitControls(camera, renderer.domElement);

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

       // Render the scene.
      controls.update();
      renderer.render(scene, camera);

    }
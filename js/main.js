 // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer;
    var N = 100;
    var cells = new Array();
    var time = parseInt(0);


    init();
    animate();

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
      camera.position.set(0,6,100);
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

      if (N < 2) {
        N = 2;
      }
      var len = N * N;
      for (var i = 0; i < len; i++) {
        cells[i] = new Cell();
        var ran = Math.random().toFixed();
        cells[i].alive = parseInt(ran);
        //console.log(cells[i].alive);
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

      updateCells();

      // Add OrbitControls so that we can pan around with the mouse.
      controls = new THREE.OrbitControls(camera, renderer.domElement);

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
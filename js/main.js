 // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer;
    var N = 10;
    var cells = new Array();
    var time = parseInt(0);
    var agents = new Array();
    var colsOn = new Array();
    var rowsOn = new Array();

    init();
    animate();

    function update() {
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
    			}
    			pos = (temp + 1) % N;
    			agents[i].pos_x = pos;
    			cells[Y*N + pos].alive = 1;
    		} else {
    			break;
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

        hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 1, 0.6 );
        hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );
        
      // var light = new THREE.PointLight(0xffffff);
      // light.position.set(-100,200,100);
      // scene.add(light);

      // Initialize cell grid

      if (N < 2) {
        N = 2;
      }
      var len = N * N;
      for (var i = 0; i < len; i++) {
        cells[i] = new Cell();
        //var ran = Math.random().toFixed();
        //cells[i].alive = parseInt(ran);
        //console.log(cells[i].alive);
      }

      var agent = new Agent();
      agent.pos_x = 0;
      agent.pos_y = 0;
      agent.direction = 0;
      agents.push(agent);

    	console.log(agents.length);


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
          mesh.position.x = i * 2 - N;
          mesh.position.y = j * 2 - N;
          mesh.position.z = 0;
          scene.add(mesh);
        }
      }

      update();

      // Add OrbitControls so that we can pan around with the mouse.
      controls = new THREE.OrbitControls(camera, renderer.domElement);

    }

    // Renders the scene and updates the render as needed.
    function animate() {

      // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
      requestAnimationFrame(animate);
    
      if (time % 10 == 0) {
        time = 1;
        update();
      }
      time++;

      for (var i = 0; i < N*N; i++) {
        if (cells[i].alive == 0) {
            scene.children[2 + i].visible = false;
        } else {
            scene.children[2 + i].visible = true;
            var hue = (parseInt(cells[i].life) % 10) * 0.1;
            //console.log(hue);
            scene.children[2 + i].material.color.setHSL(1-hue, 1.0, 0.5);
            scene.children[2 + i].scale.set(1, 1, 1 + hue * 10)
        }
      }

      console.log(colsOn);
      for (var i = 0; i < colsOn.length; i++) {
      	for (var j = 0; j < N; j++) {
	      	scene.children[2 + colsOn[i]*N + j].visible = true; 
	    }
      }

      for (var i = 0; i < colsOn.length; i++) {
      	colsOn.pop();
	  }

       // Render the scene.
      controls.update();
      renderer.render(scene, camera);

    }
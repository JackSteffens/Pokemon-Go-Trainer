angular.module('pogobot').controller('ThreeWrapperCtrl',
  function($scope) {
    // Variables
    var scene, camera, renderer, container, manager, loader, texturem;
    if (!$scope.avatar) {
      $scope.avatar = {};
    }

    // Functions
    function init() {
      var id = '#model_wrapper_'+$scope.elemId;
      console.log(id);
      if ($scope.elemId == 999) {
        console.log('999')
        container = angular.element('#model_wrapper_999');
      } else
        container = angular.element('#model_wrapper_'+$scope.elemId);
      scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera( 45, container.innerWidth() / container.innerHeight(), 0.1, 2000 );
      camera.position.z = -80;
      // camera.position.y = -360;

      renderer = new THREE.WebGLRenderer({alpha:false});
      renderer.setSize(container.innerWidth(), container.innerHeight());
      renderer.setClearColor(0xC5CAE9, 1);

			var ambient = new THREE.AmbientLight( 0x101030 );
			scene.add( ambient );
			var directionalLight = new THREE.DirectionalLight( 0xffeedd );
			directionalLight.position.set(0, 10, 6);
			scene.add( directionalLight );

      manager = new THREE.LoadingManager();
			manager.onProgress = function (item, loaded, total) {
				// console.log(item, loaded, total);
			};

			texture = new THREE.Texture();

			var onProgress = function ( xhr ) {
				if ( xhr.lengthComputable ) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					// console.log( Math.round(percentComplete, 2) + '% downloaded' );
				}
			};

			var onError = function ( xhr ) {
        console.log('Error occured');
        console.log(xhr);
			};

      // Load textures
			// loader = new THREE.ImageLoader( manager );
			// loader.load('textures/UV_Grid_Sm.jpg', function ( image ) {
			// 	texture.image = image;
			// 	texture.needsUpdate = true;
			// });

			loader = new THREE.OBJLoader(manager);
      var meshObj = 'res/3d/FemaleAvatarMesh.obj';
      if ($scope.avatar.gender == 0) meshObj = 'res/3d/MaleAvatarMesh.obj';
			loader.load( meshObj, function (object) {
				object.traverse(function(child) {
					if (child instanceof THREE.Mesh) {
            // Add textures here
						// child.material.map = texture;
					}
				});
				object.position.y = -70;
        object.rotation.y = 10;
				scene.add(object);
			}, onProgress, onError );

			renderer.setPixelRatio(window.devicePixelRatio);
      container.append(renderer.domElement);
      animate();
    } // end init();

    function animate() {
      renderer.render(scene, camera);
      renderer.setSize(container.innerWidth(), container.innerHeight());
			camera.lookAt(scene.position);
      requestAnimationFrame(animate);
    }

    init();
});

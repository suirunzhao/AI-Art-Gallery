window.addEventListener('load', function () {

    //color
    let blueviolet = new THREE.Color("rgb(138, 43, 226)");
    var randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
    let clientColor = new THREE.Color(randomColor);

    //Open and connect socket
    let socket = io();
    //Listen for confirmation of connection
    socket.on('connect', function () {
        console.log("Connected");
    });

    let scene,
        camera,
        renderer,
        pointLight;

    let mouse = {
        x: 0,
        y: 0
    };

    let users = [];

    class userLight {
        constructor(_scene, _camera) {
            this.scene = _scene
            this.position = new THREE.Vector3()
            this.mouse = new THREE.Vector2()
            this.camera = _camera
            this.pointLight = new THREE.PointLight(clientColor, 1, 5)
            this.pointLight.position.set(0, 0, 0);
            this.pointLight.castShadow = true;
            this.pointLight.shadow.bias = 0.0001;
            this.pointLight.mapSizeWidth = 1024; // Shadow Quality
            this.pointLight.mapSizeHeight = 1024; // Shadow Quality
            this.trigger = true
        }

        create() {
            if (this.trigger) {
                //this.mesh.add(new THREE.Mesh(this.geometry, this.material))
                this.scene.add(this.pointLight)
            }
            this.trigger = false
        }
        move(_position) {
            let vector = new THREE.Vector3(_position.x, _position.y, 0.5)
            vector.unproject(this.camera)
            let dir = vector.sub(this.camera.position).normalize()
            let distance = -this.camera.position.z / dir.z
            let pos = this.camera.position.clone().add(dir.multiplyScalar(distance))
            this.pointLight.position.copy(pos)
        }
    }

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.querySelector('.bg').appendChild(renderer.domElement);

        // Camera
        let screenWidth = window.innerWidth,
            screenHeight = window.innerHeight,
            viewAngle = 50,
            nearDistance = 0.1,
            farDistance = 1000;
        camera = new THREE.PerspectiveCamera(viewAngle, screenWidth / screenHeight, nearDistance, farDistance);
        camera.position.x = 0;
        camera.position.y = 5;
        camera.position.z = 8;
        //camera.rotation.x = 40;
        //camera.lookAt(scene.position);

        // OrbitControls
        //controls = new THREE.OrbitControls(camera, renderer.domElement);

        // Lights
        // Ambient light
        // ambientLight = new THREE.AmbientLight(0x333333, 0.1);
        // scene.add(ambientLight);

        //Listen for a message from the server
        // socket.on('dataAll', (obj) => {
        //     //console.log("Data message received!!!")
        //     //console.log(obj);

        //     addLight(obj);
        // });

        let objMaterial = new THREE.MeshPhongMaterial({ // Required For Shadows
            color: 0x888888,
            specular: 0x000000,
            shininess: 60,
        });

        //obj
        let objLoader = new THREE.OBJLoader();
        //new group
        let group = new THREE.Group();
        //objLoader.setMaterials(cubeMaterial);
        objLoader.setPath('assets/');
        objLoader.load('OR.obj', function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = objMaterial;
                }
            });
            object.scale.set(0, 0, 0);
            object.rotation.set(Math.PI / 3, Math.PI / 3, Math.PI / 3);
            group.add(object);
            object.position.y = -13;
            scene.add(group);

            doAnimation();

            function doAnimation() {
                gsap.to(object.rotation, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 1, // 用Tween的方式刻意的讓傳遞數值的動作產生delay
                    paused: true
                }).play()
                gsap.to(object.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 3, // 用Tween的方式刻意的讓傳遞數值的動作產生delay
                    paused: true
                }).play()
            }
        });

        // Listeners
        document.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('resize', onResize);
    }

    socket.on('dataAll', function (data) {
        for (let i = 0; i < users.length; i++) {
            if (data.id == users[i].id) {
                users[i].object.move(data.pos)
            }
        }
    })

    socket.on('user', function (data) {
        let u = new userLight(scene, camera)
        let user = {
            id: data,
            object: u,
        }
        users.push(user)
        for (let i = 0; i < users.length; i++) {
            users[i].object.create()
        }
    })

    socket.on('userLeft', function (id) {
        for (let i = 0; i < users.length; i++) {
            if (id == users[i].id) {
                scene.remove(users[i].object.mesh)
            }
        }
    })

    // Render Loop
    function render() {
        requestAnimationFrame(render);
        //cube.rotation.x += 0.005;
        // cube.rotation.y += 0.001;
        renderer.render(scene, camera);

    }

    // On mouse move
    function onMouseMove(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        let mousePos = {
            x: mouse.x,
            y: mouse.y
        }

        socket.emit('data', mousePos);
    };

    // On resize
    function onResize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    init();
    render();
});
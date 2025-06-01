const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new THREE.GLTFLoader();
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Conectado ao servidor WebSocket');
});

const otherPlayers = {};

socket.on('update_player', (data) => {
    const id = data.id;
    if (!otherPlayers[id]) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        otherPlayers[id] = cube;
    }
    const player = otherPlayers[id];
    player.position.set(data.x, data.y, data.z);
});

socket.on('remove_player', (data) => {
    const id = data.id;
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id]);
        delete otherPlayers[id];
    }
});

let model;

loader.load(
  '/static/media/scene.gltf',
  function (gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    scene.add(model);

  },
  undefined,
  function (error) {
    console.error('Erro ao carregar o modelo:', error);
  }
);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // luz ambiente suave
scene.add(ambientLight);


let keysPressed = {}

document.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

// Registrar tecla solta
document.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

function sendMovement(position) {
    socket.emit('player_move', {
        x: position.x,
        y: position.y,
        z: position.z
    });
}

let lastSent = 0;

function animate() {
    requestAnimationFrame(animate);

    if(model) {
      model.rotation.y += 0.01;
    }

    const delta = clock.getDelta();
  const moveSpeed = 5;

  if (keysPressed['w']) model.position.y += moveSpeed * delta;
  if (keysPressed['s']) model.position.y -= moveSpeed * delta;
  if (keysPressed['a']) model.position.x -= moveSpeed * delta;
  if (keysPressed['d']) model.position.x += moveSpeed * delta;

    const now = performance.now();
  if (model && now - lastSent > 100) { // 100ms = 10 vezes por segundo
    sendMovement(model.position);
    lastSent = now;
  }
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
import * as THREE from "three";
import * as SceneUtils from "./utils";
const OrbitControls = require("three-orbit-controls")(THREE);

const COLORS = [0x009b48, 0xb90000, 0x0045ad, 0xff5800, 0xffffff, 0xffd500];
const FACE_MATERIALS = COLORS.map(
  c => new THREE.MeshLambertMaterial({ color: c, ambient: c })
);
const CUBE_MATERIAL = new THREE.MeshFaceMaterial(FACE_MATERIALS);
const CUBE_SIZE = 3;
const CUBE_SPACING = 0.5;

const BOUNDARY_SIZE = CUBE_SIZE + CUBE_SPACING;
const ROTATION_SPEED = 0.1;

export default class Rubik {
  constructor(element) {
    this.width = element.clientWidth;
    this.height = element.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMapEnabled = true;
    element.append(this.renderer.domElement);

    this.camera.position.set(-20, 20, 30);
    this.camera.lookAt(this.scene.position);

    this.scene.add(new THREE.AmbientLight(0xffffff));

    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.cubes = this.makeCubes();
    this.scene.add(...this.cubes);
    this.moveQueue = [];

    this.pivot = new THREE.Object3D();
    this.isMoving = false;
    this.moveAxis = undefined;
    this.moveRotation = undefined;
    this.rotationGroup = [];

    this.render();
  }

  makeCube = (x, y, z) => {
    const cubeGeometry = new THREE.CubeGeometry(
      CUBE_SIZE,
      CUBE_SIZE,
      CUBE_SIZE
    );
    const cube = new THREE.Mesh(cubeGeometry, CUBE_MATERIAL);
    cube.castShadow = true;

    cube.position.set(x, y, z);
    cube.rubikPosition = cube.position.clone();

    return cube;
  };

  getDoMove = move => () => this.pushMove(move);

  pushMove = move => {
    this.moveQueue.push(move);
    this.doNextMove();
  };

  getMoveInfo = move => {
    let axis, center, rotation;

    switch (move) {
      case "F":
      case "F'":
        axis = "x";
        center = new THREE.Vector3(-BOUNDARY_SIZE, 0, 0);
        break;
      case "B":
      case "B'":
        axis = "x";
        center = new THREE.Vector3(BOUNDARY_SIZE, 0, 0);
        break;
      case "D":
      case "D'":
        axis = "y";
        center = new THREE.Vector3(0, -BOUNDARY_SIZE, 0);
        break;
      case "U":
      case "U'":
        axis = "y";
        center = new THREE.Vector3(0, BOUNDARY_SIZE, 0);
        break;
      case "L":
      case "L'":
        axis = "z";
        center = new THREE.Vector3(0, 0, -BOUNDARY_SIZE);
        break;
      case "R":
      case "R'":
        axis = "z";
        center = new THREE.Vector3(0, 0, BOUNDARY_SIZE);
        break;
      default:
        return [-1, new THREE.Vector3(0, 0, 0)];
    }

    rotation = move.endsWith("'") ? -1 : 1;
    return {
      axis,
      center,
      rotation
    };
  };

  getSide = move => {
    const { axis, center } = this.getMoveInfo(move);
    return this.cubes.filter(
      cube => Math.abs(cube.rubikPosition[axis] - center[axis]) < 1e-7
    );
  };

  doNextMove = () => {
    const nextMove = this.moveQueue.pop();

    if (nextMove) {
      if (!this.isMoving) {
        this.isMoving = true;
        this.pivot.rotation.set(0, 0, 0);
        this.pivot.updateMatrixWorld();
        this.scene.add(this.pivot);

        const { axis, rotation } = this.getMoveInfo(nextMove);

        this.moveAxis = axis;
        this.moveRotation = rotation;

        this.rotationGroup = this.getSide(nextMove);
        this.rotationGroup.forEach(cube => {
          SceneUtils.attach(cube, this.scene, this.pivot);
        });

        this.currentMove = nextMove;
      }
    }
  };

  doMove = () => {
    if (this.pivot.rotation[this.moveAxis] >= Math.PI / 2) {
      this.pivot.rotation[this.moveAxis] = Math.PI / 2;
      this.finishMove();
    } else if (this.pivot.rotation[this.moveAxis] <= -Math.PI / 2) {
      this.pivot.rotation[this.moveAxis] = -Math.PI / 2;
      this.finishMove();
    } else {
      this.pivot.rotation[this.moveAxis] += this.moveRotation * ROTATION_SPEED;
    }
  };

  finishMove = () => {
    this.isMoving = false;
    this.moveAxis = undefined;
    this.moveRotation = undefined;
    this.pivot.updateMatrixWorld();
    this.scene.remove(this.pivot);

    this.rotationGroup.forEach(cube => {
      cube.updateMatrixWorld();
      cube.rubikPosition = cube.position.clone();
      cube.rubikPosition.applyMatrix4(this.pivot.matrixWorld);

      SceneUtils.detach(cube, this.pivot, this.scene);
    });

    this.doNextMove();
  };

  makeCubes = () => {
    const cubes = [];
    for (let x = -1; x <= 1; ++x) {
      for (let y = -1; y <= 1; ++y) {
        for (let z = -1; z <= 1; ++z) {
          cubes.push(
            this.makeCube(
              x * BOUNDARY_SIZE,
              y * BOUNDARY_SIZE,
              z * BOUNDARY_SIZE
            )
          );
        }
      }
    }
    return cubes;
  };

  setSize = (width, height) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  render = () => {
    if (this.isMoving) {
      this.doMove();
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  };
}

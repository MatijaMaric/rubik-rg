import * as THREE from "three";

export function detach(child, parent, scene) {
  child.applyMatrix(parent.matrixWorld);
  parent.remove(child);
  scene.add(child);
}

export function attach(child, scene, parent) {
  child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));

  scene.remove(child);
  parent.add(child);
}

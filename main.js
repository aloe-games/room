import * as THREE from "three"
import {OrbitControls} from "three/addons/controls/OrbitControls"
import build_world from "./src/build_world"
import load_resources from "./src/load_resources"

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight)
const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(-20, 20, 20)
controls.target.set(0, 2, 0)
controls.update()

load_resources(["chairModel.glb", "lampModel.glb", "macScreenModel.glb", "pcScreenModel.glb", "roomTexture.jpg", "roomModel.glb", "roomLightMap.jpg"], (resources) => {
    const scene = new THREE.Scene()
    scene.add(camera)
    build_world(scene, resources)
    renderer.setAnimationLoop(() => renderer.render(scene, camera))
})

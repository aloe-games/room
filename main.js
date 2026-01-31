import * as THREE from "three"
import {DRACOLoader} from "three/addons/loaders/DRACOLoader"
import {GLTFLoader} from "three/addons/loaders/GLTFLoader"
import {OrbitControls} from "three/addons/controls/OrbitControls"

function load_resources(assets, callback) {
    const texture_loader = new THREE.TextureLoader()
    const draco_loader = new DRACOLoader()
    draco_loader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
    const gltf_loader = new GLTFLoader()
    gltf_loader.setDRACOLoader(draco_loader)
    let loaded = {}
    function load_next() {
        if (Object.keys(loaded).length >= assets.length) {
            callback(loaded)
            return
        }
        let name = assets[Object.keys(loaded).length]
        let loader = name.endsWith(".glb") ? gltf_loader : texture_loader
        loader.load("/" + name, (value) => {
            loaded[name] = value
            load_next()
        })
    }
    load_next()
}

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight)
const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(-20, 20, 20)
controls.target.set(0, 2, 0)
controls.update()

function add_model(scene, resources, key, material) {
    const model = resources[key].scene.children[0]
    model.traverse((mesh) => mesh.material = material)
    scene.add(model)
}

function build_world(scene, resources) {
    const roomTexture = resources["roomTexture.jpg"]
    roomTexture.flipY = false
    const roomLightMap = resources["roomLightMap.jpg"]
    roomLightMap.flipY = false
    const roomMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uBakedNightTexture: {value: roomTexture},
            uLightMapTexture: {value: roomLightMap},
            uLightTvColor: {value: new THREE.Color("HotPink")},
            uLightDeskColor: {value: new THREE.Color("GoldenRod")},
            uLightPcColor: {value: new THREE.Color("CornflowerBlue")},
        }, vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`, fragmentShader: `
            uniform sampler2D uBakedNightTexture;
            uniform sampler2D uLightMapTexture;
            uniform vec3 uLightTvColor;
            uniform vec3 uLightDeskColor;
            uniform vec3 uLightPcColor;
            varying vec2 vUv;
            vec3 blendLighten(vec3 base, vec3 blend) {
                return vec3(max(base.r, blend.r), max(base.g, blend.g), max(base.b, blend.b));
            }
            vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
                return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
            }
            void main() {
                vec3 bakedColor = texture2D(uBakedNightTexture, vUv).rgb;
                vec3 lightMapColor = texture2D(uLightMapTexture, vUv).rgb;
                bakedColor = blendLighten(bakedColor, uLightTvColor, lightMapColor.r * 1.5);
                bakedColor = blendLighten(bakedColor, uLightPcColor, lightMapColor.b * 1.5);
                bakedColor = blendLighten(bakedColor, uLightDeskColor, lightMapColor.g * 1.5);
                gl_FragColor = vec4(bakedColor, 1.0);
            }`
    })
    add_model(scene, resources, "roomModel.glb", roomMaterial)
    add_model(scene, resources, "chairModel.glb", roomMaterial)
    add_model(scene, resources, "lampModel.glb", new THREE.MeshBasicMaterial({color: "white"}))
    add_model(scene, resources, "pcScreenModel.glb", new THREE.MeshBasicMaterial({color: "black"}))
    add_model(scene, resources, "macScreenModel.glb", new THREE.MeshBasicMaterial({color: "black"}))
}

load_resources(["chairModel.glb", "lampModel.glb", "macScreenModel.glb", "pcScreenModel.glb", "roomTexture.jpg", "roomModel.glb", "roomLightMap.jpg"], (resources) => {
    const scene = new THREE.Scene()
    scene.add(camera)
    build_world(scene, resources)
    renderer.setAnimationLoop(() => renderer.render(scene, camera))
})

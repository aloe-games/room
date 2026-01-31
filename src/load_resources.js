import * as THREE from "three"
import {DRACOLoader} from "three/addons/loaders/DRACOLoader"
import {GLTFLoader} from "three/addons/loaders/GLTFLoader"

const texture_loader = new THREE.TextureLoader()
const draco_loader = new DRACOLoader()
draco_loader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")
const gltf_loader = new GLTFLoader()
gltf_loader.setDRACOLoader(draco_loader)

export default (assets, callback) => {
    let loaded = {}
    function load_next() {
        if (Object.keys(loaded).length >= assets.length) {
            callback(loaded)
            return
        }
        let name = assets[Object.keys(loaded).length]
        let loader = name.endsWith(".glb") ? gltf_loader : texture_loader
        loader.load("/assets/" + name, (value) => {
            loaded[name] = value
            load_next()
        })
    }
    load_next()
}

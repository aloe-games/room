import * as THREE from "three"

export default (scene, resources) => {
    const room = resources["roomModel.glb"].scene.children[0]
    const roomTexture = resources["roomTexture.jpg"]
    roomTexture.flipY = false
    const roomLightMap = resources["roomLightMap.jpg"]
    roomLightMap.flipY = false
    room.material = new THREE.ShaderMaterial({
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
    room.traverse((mesh) => mesh.material = room.material)
    scene.add(room)

    const chair = {}
    chair.group = resources["chairModel.glb"].scene.children[0]
    chair.group.traverse((mesh) => mesh.material = room.material)
    scene.add(chair.group)

    const lamp = resources["lampModel.glb"].scene.children[0]
    lamp.material = new THREE.MeshBasicMaterial({color: "white"})
    scene.add(lamp)
    const pcScreen = resources["pcScreenModel.glb"].scene.children[0]
    pcScreen.material = new THREE.MeshBasicMaterial({color: "black"})
    scene.add(pcScreen)
    const macScreen = resources["macScreenModel.glb"].scene.children[0]
    macScreen.material = new THREE.MeshBasicMaterial({color: "black"})
    scene.add(macScreen)
}

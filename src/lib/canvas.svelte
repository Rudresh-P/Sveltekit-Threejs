<script>
    import { page } from "$app/stores";
    import { afterUpdate, onMount } from "svelte";

    import * as THREE from "three";
    import gsap from "gsap";
    import load from "load-asset"

    // import index from "./index.jpg";
    // import about from "./about.jpg";
    // import blog from "./blog.jpg";
    // import contacts from "./contacts.jpg";

    
    class Sketch {
        constructor(canvas,images,start) {
            this.scene = new THREE.Scene();

            // this.container = options.dom;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.renderer = new THREE.WebGLRenderer({
                canvas:canvas
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.width, this.height);
            this.renderer.setClearColor(0xbeeef, 1);
            this.renderer.outputEncoding = THREE.sRGBEncoding;

            // this.container.appendChild(this.renderer.domElement);

            this.aspect = this.width / this.height;

            this.frustumSize = 1;
            this.camera = new THREE.OrthographicCamera(
                this.frustumSize / -2,
                this.frustumSize / 2,
                this.frustumSize / 2,
                this.frustumSize / -2,
                -1000,
                1000
            );

            this.loadingManager = new THREE.LoadingManager(
                // OnLoad
                () => {
                    // alert("Loaded")
                    this.material.uniforms.resolution.value.x = this.width;
                    this.material.uniforms.resolution.value.y = this.height;
                    this.material.uniforms.resolution.value.z = a1;
                    this.material.uniforms.resolution.value.w = a2;
                },
                // OnProgress
                (url, itemsLoaded, itemsTotal) => {
                    // console.log(itemsLoaded);
                }
            );

            this.textureLoader = new THREE.TextureLoader(this.loadingManager);

            // Image Aspect Ratio
            this.imageAspect = 1266 / 1920;

            let a1;
            let a2;
            if (this.height / this.width > this.imageAspect) {
                a1 = (this.width / this.height) * this.imageAspect;
                a2 = 1;
            } else {
                a1 = 1;
                a2 = this.height / this.width / this.imageAspect;
            }

            this.time = 0;

            this.isPlaying = true;

            load.all(images).then( assets => {

                
                this.addObjects();
                
                for (let key in assets){
                    assets[key] = this.textureLoader.load(assets[key].src)
                    // console.log(key);
                }
                
                console.log(start);
                this.material.uniforms.uTexture1.value = assets[start] || assets["index"]

                this.assets = assets;

                this.resize();
                this.render();
                this.setupResize();
            })

            
            // this.settings();
        }

        changeBG(newPage){

            let nextPage = this.assets[newPage] || this.assets["index"]

            
            this.material.uniforms.uTexture2.value = nextPage

            gsap.fromTo(this.material.uniforms.progress,{value:0} , {
                value: 1,
                duration: 1,
                overwrite: true,
                onComplete: () => {
                    this.material.uniforms.progress.value = 0;
                    this.material.uniforms.uTexture1.value = this.material.uniforms.uTexture2.value
                },
                
            })

        }

        settings() {
            let that = this;
            this.settings = {
                progress: 0,
            };
            this.gui = new GUI();
            this.gui
                .add(this.settings, "progress", 0, 1, 0.01)
                .onChange(
                    () =>
                        (this.material.uniforms.progress.value =
                            this.settings.progress)
                );
        }

        setupResize() {
            window.addEventListener("resize", this.resize.bind(this));
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.aspect = this.width / this.height;
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }

        addObjects() {
            let that = this;
            this.material = new THREE.ShaderMaterial({
                extensions: {
                    derivatives:
                        "#extension GL_OES_standard_derivatives : enable",
                },
                side: THREE.DoubleSide,
                uniforms: {
                    progress: { value: 0 },
                    resolution: { type: "v4", value: new THREE.Vector4() },
                    time: { type: "f", value: 0 },
                    uvRate1: new THREE.Vector2(1, 1),
                    uTexture1: { value: null },
                    uTexture2: { value: null },
                },
                // wireframe: true,
                // transparent: true,
                vertexShader: `
                        uniform float time;
                        varying vec2 vUv;
                        varying vec3 vPosition;
                        uniform vec2 pixels;
                        float PI = 3.141592653589793238;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                        }      
                        `,
                fragmentShader: `
                        uniform float time;
                        uniform float progress;
                        uniform sampler2D uTexture1,uTexture2;
                        uniform vec4 resolution;
                        varying vec2 vUv;
                        varying vec3 vPosition;
                        float PI = 3.141592653589793238;
                        void main()	{
                            vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
                            vec4 t1 = texture2D(uTexture1,newUV);
                            vec4 t2 = texture2D(uTexture2,newUV);

                            float dist = distance(t1,t2) /2.;

                            // dist = newUV.x + 0.1*(sin(vUv.y * 10. + time));

                            float pr = step(dist,progress);

                            vec4 finalColor = mix(
                            mix(t1,t2,pr),
                            t2,
                            pr
                            );
                            gl_FragColor = finalColor;
                            //gl_FragColor = vec4(vUv,0.,1.);
                        }
                        `,
            });

            this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

            this.plane = new THREE.Mesh(this.geometry, this.material);
            this.scene.add(this.plane);
        }

        stop() {
            this.isPlaying = false;
        }

        play() {
            if (!this.isPlaying) {
                this.render();
                this.isPlaying = true;
            }
        }

        render() {
            if (!this.isPlaying) return;
            this.time += 0.05;
            this.material.uniforms.time.value = this.time;
            requestAnimationFrame(this.render.bind(this));
            this.renderer.render(this.scene, this.camera);
        }
    }

    let sketch;
    let CanvasElement;
    let currentPage = $page.routeId;

    afterUpdate(() => {
        currentPage = $page.routeId;
        console.log(currentPage);

        if(sketch.assets) sketch.changeBG(currentPage)
    });

    onMount(() => {
        console.log(currentPage);
        sketch = new Sketch(
            CanvasElement,
            {
                index:"./index.jpg",
                blog:"./blog.jpg",
                about:"./about.jpg",
                contacts:"./contacts.jpg",
            },
            currentPage
        
        )
    });
</script>

<canvas bind:this={CanvasElement} />

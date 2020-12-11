import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader';


enum EType {
  SCROLL = 'scroll',
  WHEEL = 'wheel'
}

interface Mixer {
  obj: THREE.Group;
  mixer: THREE.AnimationMixer;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements AfterViewInit{

  @ViewChild('cube') private cube: ElementRef
  prevScroll: number = 0;
  mixers: Mixer[] = [];
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera( -200, 200, 200, -200);
  
  constructor(private renderer2: Renderer2) { }

  ngAfterViewInit() { 
    this.prevScroll = window.scrollY;

    this.camera.position.set(300, 300, 300);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(600, 600);
    this.renderer2.appendChild(this.cube.nativeElement, renderer.domElement)

    const loader = new FBXLoader();
    loader.load('../assets/cube.fbx', (obj) => {
      this.scene.add(obj);
      const mixer = new THREE.AnimationMixer( obj );
      const delta = window.scrollY / 100 + 0.5;
      mixer.clipAction(obj.animations[0]).play();
      const m: Mixer = { obj, mixer }
      this.update(m, delta);
      if (m.mixer.time === 0)
        m.mixer.update(obj.animations[0].duration - 0.5)
      this.mixers.push(m);
    });
    
    window.addEventListener( EType.SCROLL, this.onScroll, {passive: false} );

    const animate = () => {
      requestAnimationFrame( animate );
      renderer.render( this.scene, this.camera );
    };
    animate();
  }

  calculateCoord(start: number, duration: number): number {
    return duration * 100 + start;
  }

  update(m: Mixer, delta: number): void {
    const time = m.mixer.time;
    const duration = m.obj.animations[0].duration;
    if(time + delta > 0 && time + delta < duration) {
      m.mixer.update(delta);
    } 
  }

  onScroll = () => {
    const delta = (window.scrollY - this.prevScroll) / 100; 
    this.prevScroll = window.scrollY;
    this.mixers.forEach(m => {
      this.update(m, delta)
      console.log('SCROLL',  m.mixer.time, delta, window.scrollY); 
    });
  }


}






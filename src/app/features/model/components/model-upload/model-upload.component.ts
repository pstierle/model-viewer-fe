import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { CameraOptions } from 'src/app/shared/models/camera-options';
import { appRoutes } from 'src/app/shared/constants/app-routes-constant';
import { StoreService } from 'src/app/core/services/store.service';

@Component({
  selector: 'app-model-upload',
  templateUrl: './model-upload.component.html',
  styleUrls: ['./model-upload.component.scss'],
})
export class ModelUploadComponent implements OnInit, AfterViewInit {
  public cameraOptions: CameraOptions = {
    fov: 140,
    near: 1,
    far: 10000,
  };
  public modelForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
  });
  public modelProgress: number | null = null;
  public selectedFile: File | null = null;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  public camera!: THREE.PerspectiveCamera;
  public pauseAnimation = false;

  private get modelContainer(): HTMLElement | null {
    return document.getElementById('canvas');
  }

  public get canvasHeight(): number {
    return this.modelContainer?.getBoundingClientRect()?.height ?? 0;
  }

  public get canvasWidth(): number {
    return this.modelContainer?.getBoundingClientRect()?.width ?? 0;
  }

  constructor(private router: Router, private store: StoreService) {}

  async ngOnInit(): Promise<void> {
    window.addEventListener('focus', () => (this.pauseAnimation = false));
    window.addEventListener('blur', () => (this.pauseAnimation = true));
  }

  public handleFileChange(event: any) {
    this.selectedFile = event.target.files[0];
    this.modelForm.get('name')?.patchValue(this.selectedFile?.name ?? '');
    const url = URL.createObjectURL(event.target.files[0]);
    this.loadModel(url);
  }

  public async handleUploadModel() {
    if (this.selectedFile && this.modelForm.getRawValue().name) {
      await this.store.createModel(
        this.modelForm.getRawValue().name ?? '',
        this.selectedFile
      );
      await this.router.navigate(['/', appRoutes.model]);
    }
  }

  public updateCameraOptions(options: CameraOptions) {
    this.cameraOptions = options;
    this.camera.fov = options.fov;
    this.camera.near = options.near;
    this.camera.far = options.far;
    this.camera.updateProjectionMatrix();
  }

  private createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.cameraOptions.fov,
      this.canvasWidth / this.canvasHeight,
      this.cameraOptions.near,
      this.cameraOptions.far
    );
    this.camera.position.z = 4;
  }

  private clearScence() {
    while (this.scene.children.length) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  private loadModel(url: string) {
    this.clearScence();
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf: GLTF) => {
        gltf.scene.traverse((child) => {
          if ((child as any).isMesh) {
            (child as any).geometry.center();
          }
        });
        gltf.scene.name = 'MODEL';
        gltf.scene.scale.multiplyScalar(5);
        this.scene.add(gltf.scene);
        const object = this.scene.children.find(
          (child) => child.name === 'MODEL'
        );
        if (object) {
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());
          this.controls.reset();
          object.position.x += object.position.x - center.x;
          object.position.y += object.position.y - center.y;
          object.position.z += object.position.z - center.z;
          this.controls.maxDistance = size * 10;
          this.camera.near = size / 100;
          this.camera.far = size * 100;
          this.camera.updateProjectionMatrix();
        }
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        this.modelProgress = (xhr.loaded / xhr.total) * 100;
        if (progress === 100) {
          this.modelProgress = null;
        }
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log('Could not load gltf file', error);
      }
    );
  }

  async ngAfterViewInit() {
    this.createCamera();
    this.createRenderer();
    this.createScene();
    this.createControls();
    this.animate();
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0.8, 0.8, 0.8);
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbbbbbb);
    this.scene.environment = pmremGenerator.fromScene(environment).texture;
  }

  private createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enabled = true;
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    this.modelContainer?.appendChild(this.renderer.domElement);
  }

  private animate() {
    if (!this.pauseAnimation) {
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    }

    requestAnimationFrame(() => {
      this.animate();
    });
  }
}

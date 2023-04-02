import { DialogService } from './../../../../core/services/dialog.service';
import { ApiService } from 'src/app/core/services/api.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { StoreService } from 'src/app/core/services/store.service';
import { CameraOptions } from 'src/app/shared/models/camera-options';
import * as THREE from 'three';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Model } from 'src/app/shared/models/model';
import { ActivatedRoute } from '@angular/router';
import { PointOfInterest } from 'src/app/shared/models/point-of-interest';
import { PointOfInterestDialogComponent } from '../point-of-interest-dialog/point-of-interest-dialog.component';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit, AfterViewInit, OnDestroy {
  public cameraOptions: CameraOptions = {
    fov: 140,
    near: 1,
    far: 10000,
  };
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  public camera!: THREE.PerspectiveCamera;
  public pauseAnimation = false;
  public inEditMode = false;
  public model: Model | undefined = undefined;
  public animationHandler: number | undefined = undefined;
  public pointOfInterests: PointOfInterest[] = [];
  private raycaster!: THREE.Raycaster;
  private pointer!: THREE.Vector2;
  private intersectingPoint: THREE.Vector3 | null = null;
  private hoveredObject: THREE.Object3D<THREE.Event> | null = null;

  private get modelContainer(): HTMLElement | null {
    return document.getElementById('canvas');
  }

  public get canvasHeight(): number {
    return this.modelContainer?.getBoundingClientRect()?.height ?? 0;
  }

  public get canvasWidth(): number {
    return this.modelContainer?.getBoundingClientRect()?.width ?? 0;
  }

  constructor(
    private store: StoreService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private dialogService: DialogService
  ) {}

  async ngOnInit(): Promise<void> {
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    window.addEventListener('mousemove', (event) => {
      this.onMouseMove(event);
    });
    window.addEventListener('focus', () => (this.pauseAnimation = false));
    window.addEventListener('blur', () => (this.pauseAnimation = true));
    const id = this.activatedRoute.snapshot.params['id'];
    this.model = await this.store.getModel(id);
    if (this.model) {
      this.loadModel(this.model.url);
    }
  }

  public handleEditModeChange(event: MatSlideToggleChange) {
    this.inEditMode = event.checked;
  }

  public async handleClick(event: MouseEvent) {
    if (!this.inEditMode) {
      if (this.hoveredObject) {
        const foundPointOfInterest = this.pointOfInterests.find(
          (p) => p.id === this.hoveredObject?.userData['id']
        );
        if (foundPointOfInterest) {
          this.openPOIDialog(event, foundPointOfInterest);
        }
      }
    } else {
      if (this.intersectingPoint && this.model) {
        const newPointOfInterest = await this.apiService.createPointOfInterests(
          this.intersectingPoint.x,
          this.intersectingPoint.y,
          this.intersectingPoint.z,
          this.model.id
        );

        if (newPointOfInterest) {
          this.pointOfInterests.push(newPointOfInterest);
          this.createPointOfInterest(
            newPointOfInterest.id,
            newPointOfInterest.x,
            newPointOfInterest.y,
            newPointOfInterest.z
          );
        }

        this.inEditMode = false;
      } else {
        console.log('no intersecting point');
      }
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

  private loadModel(url: string) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      async (gltf: GLTF) => {
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
          if (this.model) {
            this.pointOfInterests = await this.store.getPointOfInterests(
              this.model.id
            );
            this.pointOfInterests.forEach((poi) =>
              this.createPointOfInterest(poi.id, poi.x, poi.y, poi.z)
            );
          }
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log('Could not load gltf file', error);
      }
    );
  }

  public async ngAfterViewInit() {
    this.createCamera();
    this.createRenderer();
    this.createScene();
    this.createControls();
    this.animate();
  }

  public ngOnDestroy(): void {
    if (this.animationHandler) {
      cancelAnimationFrame(this.animationHandler);
    }
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
    console.log('render');

    this.animationHandler = requestAnimationFrame(() => {
      this.animate();
    });
  }

  private onMouseMove(event: MouseEvent) {
    this.pointer.x = (event.offsetX / this.canvasWidth) * 2 - 1;
    this.pointer.y = -(event.offsetY / this.canvasHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      this.intersectingPoint = intersects[0].point;
      if (
        !this.inEditMode &&
        intersects[0].object.name === 'POINT_OF_INTEREST'
      ) {
        this.hoveredObject = intersects[0].object;
        this.hoveredObject.scale.set(2, 2, 2);
      } else {
        if (this.hoveredObject) {
          this.hoveredObject.scale.set(1, 1, 1);
          this.hoveredObject = null;
        }
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.scale.set(1, 1, 1);
        this.hoveredObject = null;
      }
      this.intersectingPoint = null;
    }
  }

  private openPOIDialog(
    event: MouseEvent,
    pointOfInterest: PointOfInterest
  ): void {
    const dialog = this.dialogService.openDialog(
      PointOfInterestDialogComponent,
      event,
      pointOfInterest
    );

    dialog.afterClosed().subscribe((data: any) => {
      if (data) {
        let poi = this.pointOfInterests.find(
          (poi) => poi.id === pointOfInterest.id
        );
        if (poi) {
          poi['name'] = data.name;
          poi['description'] = data.description;
        }
      }
    });
  }

  private createPointOfInterest(id: string, x: number, y: number, z: number) {
    const pointGeometry = new THREE.SphereGeometry(0.3);
    const pointMesh = new THREE.MeshBasicMaterial({
      color: new THREE.Color('red'),
    });
    const point = new THREE.Mesh(pointGeometry, pointMesh);
    this.scene.add(point);
    point.name = 'POINT_OF_INTEREST';
    point.userData = {
      id,
    };
    point.position.set(x, y, z);
  }
}


class SceneCreator{
    constructor(engine, canvas){
        this.canvas = canvas
        this.engine = engine
        this.scene = new BABYLON.Scene(this.engine)        
        this.cannon =  new BABYLON.CannonJSPlugin()
        this.scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), this.cannon)   
        this.drag = false    
        this.createCamera()
        this.createLight()
        this.createGruond()
        this.addSphere()        
        this.addImpostors()        
        this.events()
    }

    createCamera(){
        this.camera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(0, 5, -10))
        this.camera.setTarget(BABYLON.Vector3.Zero())        
        //this.camera.attachControl(this.canvas, true)
    }

    createLight(){
        this.light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene)        
    }

    addSphere(){
        this.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2, segments: 32}, this.scene)
        this.sphere.position.y = 2
    }

    createGruond(){
        this.ground = BABYLON.Mesh.CreateGround('ground1', 16, 16, 2, this.scene)
    }    

    addImpostors(){
        this.sphere.physicsImpostor = new BABYLON.PhysicsImpostor(this.sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 10, restitution: 0.9, friction: 1}, this.scene)
        this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, restitution: 0.9, friction: 1}, this.scene)       
    }    

    events(){        
        this.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:                                                                                  
                    this.handlePointerDown(pointerInfo)
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    this.handlePointerUp()
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:                                            
                    this.handlePointerMove(pointerInfo)
                    break;    
            }
        });
    }
    handlePointerDown(pointerInfo){                   
        if(pointerInfo && pointerInfo.pickInfo.pickedMesh === this.sphere){
            this.drag = true
            let pos = pointerInfo.pickInfo.pickedPoint
            if(!this.clickMarker){               
                this.createClickMarker()    
            }    
            this.setUVPlane(pos)
            this.setClickMarkerPos(pos)            
            this.addJoint(pos)
            this.clickMarker.isVisible = true           
        }
    }

    setClickMarkerPos(pos){        
        this.clickMarker.position = pos        
    }

    
    setUVPlane(pos){
        if(!this.uVPlane){
            this.createUVPlane()
        }
        this.uVPlane.rotationQuaternion = this.camera.rotation.toQuaternion()
        this.uVPlane.isPickable = false        
        this.uVPlane.position = pos                
    }
        
    createClickMarker(){
        this.clickMarker = new BABYLON.MeshBuilder.CreateSphere('marker', {diameter:.2, segments: 3}, this.scene)
        let material = new BABYLON.StandardMaterial('markerMaterial', this.scene)
        material.diffuseColor = new BABYLON.Color3(1,0,0)
        this.clickMarker.material = material
        this.clickMarker.physicsImpostor = new BABYLON.PhysicsImpostor(this.clickMarker, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0, restitution: 0}, this.scene)
        this.clickMarker.physicsImpostor.physicsBody.collisionFilterGroup = 0
        this.clickMarker.physicsImpostor.physicsBody.collisionFilterMask = 0
        this.clickMarker.isVisible = false        
    }

    createUVPlane(){
        this.uVPlane = new BABYLON.MeshBuilder.CreatePlane('uVPlane', {width: 100, height:100}, this.scene)
        this.uVPlane.isVisible = false
    }

    addJoint(pos){
        setTimeout(() => {
        let v = pos.subtract(this.sphere.position)        
        let antiRot = this.sphere.physicsImpostor.physicsBody.quaternion.inverse()       
        let pivot = antiRot.vmult(v)                
        
        this.joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.BallAndSocketJoint, {
            mainPivot : new BABYLON.Vector3(0,0,0),
            connectedPivot : pivot            
        })
        this.clickMarker.physicsImpostor.addJoint(this.sphere.physicsImpostor, this.joint)
        },30)       
    }

    handlePointerUp(){
        if(!this.drag) return
        if(this.clickMarker){
            this.scene.getPhysicsEngine().removeJoint(this.clickMarker.physicsImpostor,this.sphere.physicsImpostor, this.joint)
            this.drag = false
            this.clickMarker.isVisible = false
        }
    }

    handlePointerMove(pointerInfo){     
        if(!this.drag)return
        if(this.uVPlane && this.clickMarker){
        let pos = this.projectOntoPlane(pointerInfo)
        this.setClickMarkerPos(pos)         
        }
    }

    projectOntoPlane(pointerInfo){        
        let origin = pointerInfo.pickInfo.ray.origin
        let direction = pointerInfo.pickInfo.ray.direction
        let ray = new BABYLON.Ray(origin, direction, 100)
        let point = ray.intersectsMesh(this.uVPlane, true).pickedPoint
        return point
    }

    reset(){
        this.sphere.physicsImpostor.sleep()
        this.sphere.position = new BABYLON.Vector3(0,1,0)   
    }
}
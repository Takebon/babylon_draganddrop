class App{
    constructor(){
        this.canvas = document.getElementById('renderCanvas')
        this.engine = new BABYLON.Engine(this.canvas, true, {stencil: true, preserveDrawingBuffer: true})    
        window.addEventListener('resize', () => this.engine.resize())
        this.init()
        this.runGUI()    
    }

    init(){
        this.mainScene = new SceneCreator(this.engine, this.canvas)       
        this.loop()
    }

    runGUI(){
    let UI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
    let button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Reset")
        button1.width = "150px"
        button1.height = "40px"
        button1.left = 20
        button1.top = 20
        button1.fontFamily= "'Beth Ellen', cursive"
        button1.hoverCursor = "pointer"
        button1.shadowOffsetX = 4
        button1.shadowOffsetY = 4
        button1.shadowBlur = 5
        button1.shadowColor ="#e3ed92"
        button1.color = "white"
        button1.cornerRadius = 20
        button1.background = "green"        
        button1.onPointerUpObservable.add(() => {
            this.mainScene.reset()
        })
        button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
        UI.addControl(button1)    
    }


    loop(){
        this.engine.runRenderLoop(() =>{
            this.mainScene.scene.render()
        })
    }
}

const app = new App()
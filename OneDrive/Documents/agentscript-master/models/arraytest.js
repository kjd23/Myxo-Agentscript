
import Model from '../src/Model.js' // Import the modules we need.
import World from '../src/World.js'
import * as util from '../src/utils.js'

// Create PheromoneModel subclass of Model. "export" allows it to be imported elsewhere
export default class arraytest extends Model {
    // Here are the variables we'll use. They are accessed via "this.population" etc.
    population = 30 // number of turtles
    rotateAngle = 50 // rotate between -25 & +25
    addPheromone = 10 // how much to add to patches under a turtle
    evaporateToo = true // decrease all patches pheromone too?
    evaporateDelta = 0.99 // how much to decrease pheromone as fraction

    nStepsSave = 5 // will save agent position data every nStepsSave steps
    agentPos = Array() // create array for storing position data

    // worldOptions: min/max for x, y. defaultOptions(15) helper sets x, y between -15 to +15
    constructor(worldDptions = World.defaultOptions(15)) {
        super(worldDptions)
    }

    // setup is called once to initialize the model.
    setup() {
        // create population turtles, placing them randomly on the patches
        this.turtles.create(this.population, turtle => {
            const patch = this.patches.oneOf()
            turtle.setxy(patch.x, patch.y)
        })

        // initialize the patches with the pheromone value of 0
        this.patches.ask(patch => {
            patch.pheromone = 0
        })
    }

    // step is called multiple times, animating our model
    step() {
        this.turtles.ask(turtle => {
            // ask all turtles to go forward 1 and randomly rotate.
            // then add to the pheromone of the patch the turtle ends on.
            turtle.forward(1)
            turtle.rotate(util.randomCentered(this.rotateAngle))
            turtle.patch.pheromone += this.addPheromone
        })

        if (this.evaporateToo) {
            // reduce patch.pheromone by the multiple of evaporateDelta
            this.patches.ask(patch => {
                patch.pheromone *= this.evaporateDelta
            })
        }

        if (util.mod(this.ticks,this.nStepsSave) == 0) {
            // save current position data into array using .push()
            this.agentPos.push(this.turtles.map(t => t.x))
            console.log('successful data store!')
        }
    }

    // converte data to JSON format and save in file filename (.txt ideally, but .csv might also work)
    downloadArray(filename) {
        
        if(!this.agentPos) {
            console.error('Console.save: No data')
        }

        if(!filename) filename = 'console.json'

        if(typeof this.agentPos === "object"){
            var data = ''
            let dataTemp = ''
            for (let i=0; i < Math.floor(this.ticks/this.nStepsSave); i++ ) {
                for (let j=0; j < this.population; j++ ){
                    dataTemp = JSON.stringify(this.agentPos[i][j], undefined, 4)
                    data = data.concat(dataTemp,', ')
                }
                if (i !== Math.floor(this.ticks/this.nStepsSave) - 1) {
                    data = data.concat(' \n       ')
                }
            }            
        }
        util.toWindow({data})

        var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
        console.log('successful file save!')
    }
}
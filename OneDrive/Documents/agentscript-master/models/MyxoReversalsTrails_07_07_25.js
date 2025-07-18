
const L = 50// world size

export default class SlimeMoldModel extends Model {
  
    // 
    // The setup function is like a "run once" block. It gets
    // executed only once, to setup the model.
    //

    nStepsSave = 28 // will save agent position data every nStepsSave steps
    agentPos = Array() // create array for storing position data // ex, 10, 5000 for 10 savesteps 5000 turtles
    agentHead = Array() // create array for heading data
    turtleNumber = 5000
    addPheromone = 0.1 // how mutch to add to patches under a turtle
    pheromoneDecay=.95
    refrac_rate = 0.56
	
    constructor(worldDptions = World.defaultOptions(L)) {
        super(worldDptions)
    }  

    setup() {
    this.turtlePositions = {}
    this.stepCount = 0
    this.radius = 1
    this.meanNumb = this.turtleNumber / (2*L) / (2*this.radius) * (this.radius**2 * Math.PI)
    this.turtles.create(this.turtleNumber);
    this.patches.setDefault('pheromone', 0);
    
    // Give each turtle a random starting position with periodic behavior
    this.turtles.ask((turtle, turtleIndex) => {
        // Generate periodic x positions using sin(x) + x transformation
        let x = util.randomFloat2(-L,L);
        // let x = Math.sin(turtleIndex * this.turtleConstant) * 20 + turtleIndex * this.turtleConstant; // original
        
        // Use randomFloat2 for y position for variation
        let y = util.randomFloat2(-L, L);
        
        turtle.setxy(x, y);
        
        // Initialize and store initial position for each turtle
        this.turtlePositions[turtleIndex] = [{ x: turtle.xcor, y: turtle.ycor }];
        
        turtle.heading = util.randomInt(360); // randomize heading 2/7
    });

    this.turtles.ask(turtle => {
        turtle.refractoryPeriod = false; // Initialize refractory period state
    });

    this.agentPos.push(this.turtles.map(t => t.x))
    this.agentHead.push(this.turtles.map(t => t.heading))
    console.log('successful data store!')
}

    
    // The step function is like a "run forever" block. It gets
    // executed over and over again.
    
    step() {        

        this.stepCount++; // Increment step count on each step
        console.log(`Step count: ${this.stepCount}`); // Log step count to the console


      	// change to every 1 min. to change data output
        this.turtles.ask((turtle, turtleIndex) => {

        // variables
        let delta_t = .1
        let speed = 7
        let radius = this.radius
        let wiggleAngle = 30
        let D = 0.1 // diffusion
        let Diff_flag = 0
        let turtles_in_radius = this.turtles.inRadius(turtle, radius, true)

        
                    const mod = util.mod
        
                        const turtleForwardVec = util.getDirectionVector(turtle.heading);
        
                 // Calculate the heading exactly opposite to the focal turtle's heading
                const turtleOppositeHeading = util.mod(turtle.heading + 180, 360)
        
                    const opposed_turtles_ahead = turtles_in_radius.filter(a => {
                    // Condition 1: Angular opposition
                    // Check if the neighbor's heading is within 'theta' of the focal turtle's *opposite* heading.
                    // The trick with `mod(angleDiff + 180, 360) - 180` correctly finds the shortest angular difference
                    // across the 0/360 boundary.
                    const angleDifference = turtleOppositeHeading - a.heading;
                    const isHeadingOpposed = Math.abs(util.mod(angleDifference + 180, 360) - 180) <= theta;
        
                    // Condition 2: Spatial position
                    // Get the vector from the focal turtle to the neighbor 'a'
                    const vecFromTurtleToA = { x: a.x - turtle.x, y: a.y - turtle.y };
        
                    // Check if 'a' is physically in the forward hemisphere of 'turtle'.
                    // Dot product > 0 means the neighbor is generally in the direction of turtleForwardVec.
                    const isSpatiallyAhead = util.dotProduct(turtleForwardVec, vecFromTurtleToA) > 0;
        
                    return isHeadingOpposed && isSpatiallyAhead;
                });
                console.log(opposed_turtles_ahead)
        
                    // const aligned_turtles_ahead = turtles_in_radius.filter(a => Math.abs(turtle.heading - a.heading) <= theta);
                    //aligned_turtles_ahead.ask(a => {
                    //    if (mod(Math.abs(turtle.heading - a.heading),360) < theta) {
                    //        aligned_turtles_ahead.push(a)
                    //    }
                    //})
                    //console.log(aligned_turtles_ahead.length)
                    //console.log('made it here')
        
                    // const aligned_turtles_behind = turtles_in_radius
                    // aligned_turtles_behind.ask(a => {
                    //     if (Math.abs(mod(turtle.heading + 180, 360) - a.heading) <= theta) {
                    //         aligned_turtles_behind.push(a)
                    //     }
                    // })
        
                    // Reversal Rate lambda
                    let lambda_0 = 1/7
                    let lambda_c = 2*1/7 //change should be around 0.5 or 2-fold
                    let q = 14 // cooperativity
                    let u_c = 45 // change // lowering this thershold will increase cooperativty, lowering reversal rate (try 350, lower 300s)
                    //console.log(u_c)
                    let lambda = lambda_0 + lambda_c * ((opposed_turtles_ahead.length**q) / (opposed_turtles_ahead.length**q + u_c**q));
                    console.log(lambda)
        

       // Reversal
       var random_float = util.randomFloat(1);
       if (!turtle.refractoryPeriod && random_float < lambda * delta_t) {
           // Set reversal flag
           turtle.reversalFlag = true
           // Set refractory period state to true
           turtle.refractoryPeriod = true
       }
       if (turtle.refractoryPeriod && random_float < this.refrac_rate * delta_t) {
           turtle.refractoryPeriod = false
           // Set refractory state to false
     }      
	 // Modified rate considering costreaming
   
           // Random wiggle
           let sigma = 10
           let a = sigma*delta_t
           var randomWiggle = util.randomFloat2(-a,a)
           turtle.left(randomWiggle)
 //
          
      // We look at three patches: directly ahead, ahead and to the right,
      // and ahead and to the left of the turtle
      let patchAhead = turtle.patchAhead(1)
      let patchRight = turtle.patchRightAndAhead(wiggleAngle, 1)
      let patchLeft = turtle.patchLeftAndAhead(wiggleAngle, 1)
      
      if (patchAhead && patchLeft && patchRight) {
          // If the patch to the right has the most pheromone, we turn right
          if (patchRight.pheromone > patchLeft.pheromone &&
              patchRight.pheromone > patchAhead.pheromone) {
              turtle.right(wiggleAngle) 
          }

          // If the patch to the left has the most pheromone, we turn left
          if (patchLeft.pheromone > patchRight.pheromone &&
              patchLeft.pheromone > patchAhead.pheromone) {                  
              turtle.left(wiggleAngle)  
          }
          
        // If the patch ahead has the most pheromone, we don't rotate at all
      } 

      // If there's no patch to our right or left (because we're at the edge
      // of the world) we turn around.
      // if (!patchRight) turtle.left(90)
      // if (!patchLeft) turtle.right(90)
        
      // This last bit should look familiar. Move forward,
      // and add some pheromone to the turtle's patch this.turtles.ask((turtle, turtleIndex) => {

        if (turtle.reversalFlag) {
            // Set reversal flag to false
            turtle.reversalFlag = false
            // reverse heading
            turtle.left(180)
        }

      turtle.forward(speed*delta_t+Diff_flag*util.randomNormal(0,Math.sqrt(2*D*delta_t)))
      turtle.patch.pheromone += this.addPheromone
    })

    // This part is new. patches.diffuse() causes each patch to give
    // some of its pheromone to its neighbors. Try changing the
    // diffusion amount and see what happens.
    this.patches.diffuse('pheromone', 1)

    // Evaporate the pheromone over time
    this.patches.ask(patch => {
          patch.pheromone *= this.pheromoneDecay
      }) 
      
      if (util.mod(this.ticks,this.nStepsSave) == 0) {
        // save current position data into array using .push()
        this.agentPos.push(this.turtles.map(t => t.x))
        console.log('successful data store!')
   }

   if (util.mod(this.ticks,this.nStepsSave) == 0) {
       // save current position data into array using .push()
       this.agentHead.push(this.turtles.map(t => t.heading))
       console.log('successful data store!')
  }
}
  // Function to log turtle positions
   printPositions() {
       return this.turtles.map(t => t.x)
   }

   printHeading() {
       return this.turtles.map(h => h.heading)
   }

   downloadPosArray(PosFilename) {

       if(!this.agentPos) {
           console.error('Console.save: No data')
       }

       if(!PosFilename) PosFilename = 'console.json'

       if(typeof this.agentPos === "object"){
           var data = ''
           let dataTemp = ''
           for (let i=0; i < Math.floor(this.ticks/this.nStepsSave) + 1; i++ ) {
               for (let j=0; j < this.turtleNumber; j++ ){
                   dataTemp = JSON.stringify(this.agentPos[i][j], undefined, 4)
                   data = data.concat(dataTemp,', ')
               }
               if (i !== Math.floor(this.ticks/this.nStepsSave)) {
                   data = data.concat(' \n       ')
               }
           }
       }
       util.toWindow({data})

       var blob = new Blob([data], {type: 'text/json'}),
       e    = document.createEvent('MouseEvents'),
       a    = document.createElement('a')

       a.download = PosFilename
       a.href = window.URL.createObjectURL(blob)
       a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
       e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
       a.dispatchEvent(e)
       console.log('successful file save!')
   }

   downloadHeadArray(HeadFilename) {

       if(!this.agentHead) {
           console.error('Console.save: No data')
       }

       if(!HeadFilename) HeadFilename = 'console.json'

       if(typeof this.agentHead === "object"){
           var data = ''
           let dataTemp = ''
           for (let i=0; i < Math.floor(this.ticks/this.nStepsSave) + 1; i++ ) {
               for (let j=0; j < this.turtleNumber; j++ ){
                   dataTemp = JSON.stringify(this.agentHead[i][j], undefined, 4)
                   data = data.concat(dataTemp,', ')
               }
               if (i !== Math.floor(this.ticks/this.nStepsSave)) {
                   data = data.concat(' \n       ')
               }
           }
       }
       util.toWindow({data})

       var blob = new Blob([data], {type: 'text/json'}),
       e    = document.createEvent('MouseEvents'),
       a    = document.createElement('a')

       a.download = HeadFilename
       a.href = window.URL.createObjectURL(blob)
       a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
       e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
       a.dispatchEvent(e)
       console.log('successful file save!')
   }

}


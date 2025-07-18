
const L = 20 // world size

export default class SlimeMoldModel extends Model {
  
    // 
    // The setup function is like a "run once" block. It gets
    // executed only once, to setup the model.
    //

    nStepsSave = 28 // will save agent position data every nStepsSave steps
    agentPos = Array() // create array for storing position data // ex, 10, 5000 for 10 savesteps 5000 turtles
    agentHead = Array() // create array for heading data
    turtleNumber = 5000
    addPheromone = 10 // how mutch to add to patches under a turtle
	
    constructor(worldDptions = World.defaultOptions(L)) {
        super(worldDptions)
    }  

    setup() {
    this.turtlePositions = {}
    this.stepCount = 0
    this.radius = 1
    this.turtleConstant = this.turtleNumber / (40) / (1 * this.radius**2 * Math.PI)
    this.turtles.create(this.turtleNumber);
    this.patches.setDefault('pheromone', 0);
    
    // Give each turtle a random starting position with periodic behavior
    this.turtles.ask((turtle, turtleIndex) => {
        // Generate periodic x positions using sin(x) + x transformation
        let x = util.randomFloat2(-5,5);
        //x = Math.sin(turtleIndex * this.turtleConstant) * 20 + turtleIndex * this.turtleConstant; // original
        
        // Use randomFloat2 for y position for variation
        let y = util.randomFloat2(-5, 5);
        
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
        let delta_t = .025
        let speed = 7
        let radius = this.radius
        let wiggleAngle = 30
        let D = 0.1 // diffusion
        let Diff_flag = 0
        let turtles_in_radius = this.turtles.inRadius(turtle, radius, true)
        let theta = 89
    
        // Filter turtles ahead
        const aligned_turtles_ahead = turtles_in_radius.filter(a => Math.abs(turtle.heading - a.heading) <= theta);
        
        // aligned_turtles_ahead.ask(a => {
        //     if (Math.abs(turtle.heading - a.heading) <= theta) {
        //         aligned_turtles_ahead.push(a)
        //     }
        // })
       
        const mod = util.mod

     // Filter turtles behind
        const aligned_turtles_behind = turtles_in_radius.filter(a => Math.abs(mod(turtle.heading + 180, 360) - a.heading) <= theta);

    //  const aligned_turtles_behind = turtles_in_radius
    //  aligned_turtles_behind.turtles.ask(a => {
    //      if (Math.abs(mod(turtle.heading + 180, 360) - a.heading) <= theta) {
    //          aligned_turtles_behind.push(a)
    //      }
    //  })

       // Reversal Rate, roughly every 7 steps
	 let lambda_0 = 0
     let lambda_c = 2*lambda_0 //change should be around 0.5
     let q = 3 // cooperativity
     let u_c = 4 * this.turtleConstant // change
     let lambda = lambda_0 + lambda_c * ((aligned_turtles_ahead.length**q) / (aligned_turtles_ahead.length**q + u_c**q))

       // Reversal
     var random_float = util.randomFloat(1);
     if (!turtle.refractoryPeriod && random_float < (1/7)) {
         turtle.left(180);

         // Set refractory period state and duration
         turtle.refractoryPeriod = true;
         turtle.refractoryPeriodCount = 4; // Duration of refractory period
     }      
	 // Modified rate considering costreaming
     // let lambda_s = 0
     // let u_s = lambda_s / 2
     // let p = 1
     // let modified_lambda = lambda - lambda_s * ((aligned_turtles_behind.length**p) / (aligned_turtles_behind.length**p + u_s**p))
       
     if (turtle.refractoryPeriod) {
         turtle.refractoryPeriodCount--;

         if (turtle.refractoryPeriodCount <= 0) {
             turtle.refractoryPeriod = false;
         }
     }
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
      if (!patchRight) turtle.left(90)
      if (!patchLeft) turtle.right(90)
        
      // This last bit should look familiar. Move forward,
      // and add some pheromone to the turtle's patch
      turtle.forward(speed*delta_t+Diff_flag*util.randomNormal(0,Math.sqrt(2*D*delta_t)))
      turtle.patch.pheromone += this.addPheromone
    })

    // This part is new. patches.diffuse() causes each patch to give
    // some of its pheromone to its neighbors. Try changing the
    // diffusion amount and see what happens.
    this.patches.diffuse('pheromone', 0)

    // Evaporate the pheromone over time
    this.patches.ask(patch => {
          patch.pheromone *= 0.99
      }) 
      
    

}
}
export default class SlimeMoldModel extends Model {
    
    // 
    // The setup function is like a "run once" block. It gets
    // executed only once, to setup the model.
    // 
	turtlePositions = {}
  
    setup() {
        // This line should look familiar. One important difference:
        // in the editor, you say "this.turtles" instead of "model.turtles"
      	let turtleNumber = 250
      	this.turtleConstant = turtleNumber / 50
        this.turtles.create(turtleNumber)
        
        // The next line is what gives all patches a property called
        // "pheromone", equal to 0. We were doing this behind the scenes before.
        this.patches.setDefault('pheromone', 0)
        
        // Give each turtle a random starting position
        this.turtles.ask((turtle,turtleIndex) => {
            // Say something about the world here, and how you can mess
            // with it in the view tab
            let [x, y] = this.world.randomPoint()
            turtle.setxy(x, util.randomFloat2(-1,1))
          
			// Initialize turtlePositions object for each turtle
            this.turtlePositions[turtleIndex] = [{ x: turtle.xcor, y: turtle.ycor }] // Store initial position        
         
          	turtle.heading = 90
        })
    }
    
    // 
    // The step function is like a "run forever" block. It gets
    // executed over and over again.
    // 
  
    step() {        
        this.turtles.ask((turtle, turtleIndex) => {

		if (!this.turtlePositions[turtleIndex]) {
                this.turtlePositions[turtleIndex] = [] // Initialize if not already
            }

            // Inside the step function, update turtle positions and store them
            this.turtlePositions[turtleIndex].push({ x: turtle.xcor, y: turtle.ycor })
        
        // variables
        let delta_t = .025
        let speed = 7
        let radius = 1 // change
        let wiggleAngle = 30 // This is an interesting variable to play with
        let turtles_in_radius = this.turtles.inRadius(turtle, radius, true)
        let theta = 89

		const aligned_turtles_ahead = turtles_in_radius
        this.turtles.ask(a => {
            if (Math.abs(turtle.heading - a.heading) <= theta) {
                aligned_turtles_ahead.push(a)
            }
        })
          
        const mod = util.mod
        const aligned_turtles_behind = turtles_in_radius
        this.turtles.ask(a => {
            if (Math.abs(mod(turtle.heading + 180, 360) - a.heading) <= theta) {
                aligned_turtles_behind.push(a)
            }
        })

          
        // let aligned_turtles_ahead = turtlesAlignedAhead(turtle, turtles_ahead, theta)
        // let aligned_turtles_behind = this.turtlesAlignedBehind(turtle, turtles_ahead, theta)

          // Reversal Rate lambda
		let lambda_0 = 1/7
        let lambda_c = 6 //change
        let q = 3
        let u_c = 4 * this.turtleConstant // change
        let lambda = lambda_0 + lambda_c * ((aligned_turtles_ahead.length^q) / (aligned_turtles_ahead.length^q + u_c^q))

		  // Reversal
          var random_float = util.randomFloat(1)
          if (random_float < lambda*delta_t) {
              turtle.left(180)
          }        
		 // Modified rate considering costreaming
          let lambda_s = 0
          let u_s = lambda_s / 2
          let p = 1
          let modified_lambda = lambda - lambda_s * ((aligned_turtles_behind.length^p) / (aligned_turtles_behind.length^p + u_s^p))

           // Random wiggle
           let sigma = 0
           let a = sigma*delta_t
           var randomWiggle = util.randomFloat2(-a,a)
           turtle.left(randomWiggle)
 
          
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
          turtle.forward(speed*delta_t)
        turtle.patch.pheromone += 0
        })

        // This part is new. patches.diffuse() causes each patch to give
        // some of its pheromone to its neighbors. Try changing the
        // diffusion amount and see what happens.
        this.patches.diffuse('pheromone', 0.5)

        // Evaporate the pheromone over time
        this.patches.ask(patch => {
            patch.pheromone *= 0.1
        })             
    }
  getTurtlePositionData(turtle_index) {
        return this.turtle_positions[turtle_index]
    }
    this.exportCSV()
  exportCSV() {
        const csvContent = []
        csvContent.push(['TurtleIndex', 'Step', 'X', 'Y'])

        Object.keys(this.turtlePositions).forEach(turtleIndex => {
            const positions = this.turtlePositions[turtleIndex]
            positions.forEach((pos, step) => {
                csvContent.push([turtleIndex, step, pos.x, pos.y])
            })
        })

        const csvString = csvContent.map(row => row.join(',')).join('\n')
        this.downloadCSV(csvString, 'turtle_positions.csv')
    }

    downloadCSV(csvString, fileName) {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
        } else {
            const link = document.createElement('a')
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', fileName)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }export default class SlimeMoldModel extends Model {
    
                // 
                // The setup function is like a "run once" block. It gets
                // executed only once, to setup the model.
                // 
                turtlePositions = {}
              
                setup() {
                    // This line should look familiar. One important difference:
                    // in the editor, you say "this.turtles" instead of "model.turtles"
                      let turtleNumber = 10
                      this.turtleConstant = turtleNumber / 50
                    this.turtles.create(turtleNumber)
                    
                    // The next line is what gives all patches a property called
                    // "pheromone", equal to 0. We were doing this behind the scenes before.
                    this.patches.setDefault('pheromone', 0)
                    
                    // Give each turtle a random starting position
                    this.turtles.ask((turtle,turtleIndex) => {
                        // Say something about the world here, and how you can mess
                        // with it in the view tab
                        let [x, y] = this.world.randomPoint()
                        turtle.setxy(x, util.randomFloat2(-1,1))
                      
                        // Initialize turtlePositions object for each turtle
                    this.turtlePositions[turtleIndex] = []; // Initialize positions array for each turtle
                    this.turtlePositions[turtleIndex].push({ x: turtle.xcor, y: turtle.ycor }); // Store initial position         
                          turtle.heading = 90
                    })
                }
                
                // 
                // The step function is like a "run forever" block. It gets
                // executed over and over again.
                // 
              
                step() {        
                    this.turtles.ask((turtle, turtleIndex) => {
            
                    if (!this.turtlePositions[turtleIndex]) {
                            this.turtlePositions[turtleIndex] = [] // Initialize if not already
                        }
            
                    // Inside the step function, update turtle positions and store them
                    this.turtlePositions[turtleIndex].push({ x: turtle.xcor, y: turtle.ycor });
                    console.log(`Turtle ${turtleIndex} position: (${turtle.xcor}, ${turtle.ycor})`);  
                      
                    // variables
                    let delta_t = .025
                    let speed = 7
                    let radius = 1 // change
                    let wiggleAngle = 30 // This is an interesting variable to play with
                    let turtles_in_radius = this.turtles.inRadius(turtle, radius, true)
                    let theta = 89
            
                    const aligned_turtles_ahead = turtles_in_radius
                    this.turtles.ask(a => {
                        if (Math.abs(turtle.heading - a.heading) <= theta) {
                            aligned_turtles_ahead.push(a)
                        }
                    })
                      
                    const mod = util.mod
                    const aligned_turtles_behind = turtles_in_radius
                    this.turtles.ask(a => {
                        if (Math.abs(mod(turtle.heading + 180, 360) - a.heading) <= theta) {
                            aligned_turtles_behind.push(a)
                        }
                    })
            
                      
                    // let aligned_turtles_ahead = turtlesAlignedAhead(turtle, turtles_ahead, theta)
                    // let aligned_turtles_behind = this.turtlesAlignedBehind(turtle, turtles_ahead, theta)
            
                      // Reversal Rate lambda
                    let lambda_0 = 1/7
                    let lambda_c = 6 //change
                    let q = 3
                    let u_c = 4 * this.turtleConstant // change
                    let lambda = lambda_0 + lambda_c * ((aligned_turtles_ahead.length^q) / (aligned_turtles_ahead.length^q + u_c^q))
            
                      // Reversal
                      var random_float = util.randomFloat(1)
                      if (random_float < lambda*delta_t) {
                          turtle.left(180)
                      }        
                     // Modified rate considering costreaming
                      let lambda_s = 0
                      let u_s = lambda_s / 2
                      let p = 1
                      let modified_lambda = lambda - lambda_s * ((aligned_turtles_behind.length^p) / (aligned_turtles_behind.length^p + u_s^p))
            
                       // Random wiggle
                       let sigma = 0
                       let a = sigma*delta_t
                       var randomWiggle = util.randomFloat2(-a,a)
                       turtle.left(randomWiggle)
             
                      
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
                      turtle.forward(speed*delta_t)
                    turtle.patch.pheromone += 0
                    })
            
                    // This part is new. patches.diffuse() causes each patch to give
                    // some of its pheromone to its neighbors. Try changing the
                    // diffusion amount and see what happens.
                    this.patches.diffuse('pheromone', 0.5)
            
                    // Evaporate the pheromone over time
                    this.patches.ask(patch => {
                        patch.pheromone *= 0.1
                    })             
                }
              getTurtlePositionData(turtleIndex) {
                    return this.turtlePositions[turtleIndex]
                }
            }
            
            
        }
    }
}


<html>
<head>
    <title>Myxo</title>
</head>
<body>
    <script type="module">
        import * as util from '../src/utils.js'
        import Model from '../models/myxomodeltest.js'
        import TwoDraw from '../src/TwoDraw.js'
        import ColorMap from '../src/ColorMap.js'

        let PosFilename= 'position.txt'
        let HeadFilename= 'heading.txt' // try .csv extension

        // util.printToPage('Running for 100 steps.')
        const colorMap = ColorMap.gradientColorMap(
            8, ['black', 'purple', 'yellow']
        )
        const model = new Model()
        // await model.startup()
        model.setup()

        const view = new TwoDraw(model, {
            div: 'modelDiv',
            patchSize: 20,
            drawOptions: {
                turtlesSize: 2,
                patchesColor: (p) => colorMap.scaleColor(p.pheromone, 0, 100)
            }
        })

        let steps = 280

        util.repeat(steps, model.step);
        view.draw();
        
        util.toWindow({util, model, view});

        model.downloadPosArray(PosFilename);
        model.downloadHeadArray(HeadFilename);

    </script>
</body>
</html>


// 
// util.repeat(100, model.step)
// let t2 = model.printPositions()
// let h2 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t3 = model.printPositions()
// let h3 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t4 = model.printPositions()
// let h4 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t5 = model.printPositions()
// let h5 = model.printPositions()
// 
// util.repeat(100, model.step)
// let t6 = model.printPositions()
// let h6 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t7 = model.printPositions()
// let h7 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t8 = model.printPositions()
// let h8 = model.printHeading()
// 
// util.repeat(100, model.step)
// let t9 = model.printPositions()
// 
// // let h = model.printHeading()

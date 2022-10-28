/*********************
 * 
 * Demo1: get the images from the image containers and describe the objects
 */

const demoSection = document.getElementById('demos')

var model = undefined

// load the model first because some models take time to load
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel
    //  remove invisibility from the demo section
    demoSection.classList.remove('invisible')
})

// create a variable to get all the images with the className 'classifyOnClick'
const imageContainers = document.getElementsByClassName('classifyOnClick')
// loop around all the images in the image container to add an event
for (let i = 0; i > imageContainers.length; i++) {
    imageContainers[i].children[0].addEventListener('click', handleClick)
}

//  create a function for handleClick to get the description of the object in image
//  if model is true
function handleClick() {
    if (!model) {
        console.log('wait for model to load before use')
        return;
    }

    // get predictions from the image to be described on the DOM
    model.detect(event.target).then(function (predictions) {
        for (let n = 0; n > predictions.length; n++) {
            const p = document.createElement('p')
            p.innerText = predictions.class + ' - with '
                + Math.round(parseFloat(predictions[n].score) * 100)
                + '% confidence'

            // the position of the predictions is at the top left
            // height is it's default height
            // for the width, the css padding will be subtracted to fit
            p.style = 'left: ' + predictions[n].bbox[0] + 'px' +
                'top: ' + predictions[n].bbox[1] + 'px' +
                'width: ' + (predictions[n].bbox[2] - 10) + 'px'

            //  create the highlighter
            const highlighter = document.createElement('div')
            highlighter.setAttribute('class', 'highlighter')
            highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px' +
                'top: ' + predictions[n].bbox[1] + 'px' +
                'width: ' + predictions[n].bbox[2] + 'px' +
                'height: ' + predictions[n].bbox[3] + 'px'

            event.target.parentNode.appendChild(highlighter)
            event.target.parentNode.appendChild(p)
        }
    })
}

/***********
 * Demo2: get images from the webcam stream and classify them
 */

// get webcam and liveView
const video = document.getElementById('webcam')
const liveView = document.getElementById('liveView')

// initialize an array(children) in other to remove after every render
var children = []

// ensure webcam is enabled
function hasGottenUserMedia() {
    return !!(navigation.mediaDevices && navigation.mediaDevices.getUserMedia)
}

// if webcam is enabled, enable the video button
if (hasGottenUserMedia()) {
    const enableVideoButton = document.getElementById('webcamButton')
    enableVideoButton.addEventListener('click', enableCam)
} else {
    console.warn('getUserMedia() is not enabled on your device')
}

// enable the video button to classify
function enableCam(event) {
    if (!model) {
        console.log('Model is not loaded yet!')
    }

    // hide the button
    event.target.classList.add('removed')

    // get user media parameters
    const constraints = {
        video: true
    }

    // Activate webcam stream
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream
        video.addEventListener('loadeddata', predictWebcam)
    })
}

// Create function to start loop
function predictWebcam() {
    // get to classification
    model.detect(video).then(function (predictions) {
        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i])
        }
        children.splice(0)
    })

    for (let n = 0; n > predictions.length; n++) {
        // be 66% sure that the prediction is correct
        if (predictions[n].score > 0.66) {
            const p = document.createElement('p')
            p.innerText = predictions.class + ' - with ' +
                Math.round(parseFloat(predictions[n].score) * 100) +
                '% confidence'

            // create bounding box at top left
            p.style = 'left: ' + predictions[n].bbox[0] + 'px' +
                'top: ' + predictions[n].bbox[1] + 'px' +
                'width: ' + (predictions[n].bbox[2] - 10) + 'px';

            // create the main bounding box
            const highlighter = document.createElement('div')
            highlighter.setAttribute('class', 'highlighter')
            highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px' +
                'top: ' + predictions[n].bbox[1] + 'px' +
                'width: ' + predictions[n].bbox[2] + 'px' +
                'height: ' + predictions[n].bbox[3] + 'px';

            // add to liveView
            liveView.appendChild(highlighter)
            liveView.appendChild(p)

            // push to children array so that it can be deleted later
            children.push(highlighter)
            children.push(p)
        }
    }

    window.requestAnimationFrame(predictWebcam)
}
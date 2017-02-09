var watson = require('watson-developer-cloud');
var fetch = require('node-fetch');
var fs = require('fs');
var visRecCredentials = {
    url: process.env.VIS_REC_API_URL,
    api_key: process.env.VIS_REC_API_KEY
};

var visualRecognition = watson.visual_recognition({
  api_key: process.env.VIS_REC_API_KEY,
  version: 'v3',
  version_date: '2016-05-20'
});

function classifyImage (imgPath) {
    var params = {
        images_file: fs.createReadStream(imgPath)
    };

    visualRecognition.classify(params, function(err, res) {
        if (err)
            console.log(err);
        else
            console.log(JSON.stringify(res, null, 2));
    });
}

// classifyImage('./public/media/image-dark-garage-6.jpg');

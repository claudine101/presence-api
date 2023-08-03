const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS");
const Upload = require("../Upload");
const path = require('path')

class VolumePvUpload extends Upload
{
          constructor() {
                    super()
                    this.destinationPath = path.resolve('./') + path.sep + 'public' + IMAGES_DESTINATIONS.pv
          }
}
module.exports = VolumePvUpload
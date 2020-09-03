const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const {
  stackTraceLimit
} = require('../utils/errorResponse');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

  res.status(200).json(res.advancedResults);
});

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      //customised error response
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  };
  //general error response
  res.status(200).json({
    success: true,
    data: bootcamp
  });
});


//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamp
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: {
      bootcamp
    }
  });
});

//@desc     UPdate bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // console.log('aa');
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!bootcamp) {
    return next(
      //customised error response
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      //customised error response
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Triger cascade delete middleware in the models-bootcamp
  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

//@desc     Get bootcamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const {
    zipcode,
    distance
  } = req.params;

  // Get lat/lng from the geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Cal radius using radians
  // Divide distance by radius of Earth
  // Earth radius = 3963 miles
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    //the calculator is from the mongodb document
    location: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

//@desc     Upolad photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      //customised error response
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(
      //customised error response
      new ErrorResponse(`Plese upload a photo`, 404)
    );
  }
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(
      //customised error response
      new ErrorResponse(`Plese upload a image file`, 404)
    );
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      //customised error response
      new ErrorResponse(`Plese upload a image less than ${process.env.MAX_FILE_UPLOAD}`, 404)
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(
        //customised error response
        new ErrorResponse(`Problem with file upload`, 500)
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });

    res.status(200).json({
      success: true,
      data: file.name
    });
  })

});
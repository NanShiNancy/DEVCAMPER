const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

  let query;

  // Copy req.qurey
  const reqQuery = {
    ...req.query
  };

  // Fields to exclude
  const removeFields = ['select', 'sort'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create operators $gt $gte, etc
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  console.log(queryStr);
  //Finding resource
  //https://docs.mongodb.com/manual/reference/operator/query/gt/
  query = Bootcamp.find(JSON.parse(queryStr));


  // Select fields
  //https://mongoosejs.com/docs/queries.html
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join();
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Executing query
  const bootcamps = await query;
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
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
    data: bootcamp
  });
});

//@desc     UPdate bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
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
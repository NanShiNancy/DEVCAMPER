const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Show all bootcamps'
  });
}

//@desc     Get single bootcamps
//@route    GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = (req, res, next) => {
  try {
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
  } catch (err) {
    next(
      //customised error response
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  };
};


//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamp
//@access   Private
exports.createBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
};

//@desc     UPdate bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Display bootcamp ${req.params.id}`
  });
}

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`
  });
}
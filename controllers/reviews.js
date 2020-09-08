const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Boocamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');


//@desc     Get reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampsId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  console.log('1');
  // console.log(req.params.bootcampId);
  if (req.params.bootcampId) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampId
    });

    console.log('2');
    // console.log();
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    // console.log('test');

    // console.log(res.advancedResults);
    // const result = res.advancedResults;
    res.status(200).json(res.advancedResults);
  }
});
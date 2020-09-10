const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  UpdateReview,
  DeleteReview
} = require('../controllers/reviews');


const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({
  mergeParams: true
});

const {
  protect,
  authorize
} = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews).post(protect, authorize('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), UpdateReview)
  .delete(protect, authorize('user', 'admin'), DeleteReview);





module.exports = router;
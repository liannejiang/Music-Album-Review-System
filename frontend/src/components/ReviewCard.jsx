const ReviewCard = ({ review }) => (
  <div className="py-3">
    <div className="flex items-center justify-between">
      <span className="font-semibold">{review.userName}</span>
      <span className="text-yellow-400" aria-label={`${review.stars} out of 5 stars`}>
        {'★'.repeat(review.stars)}
        <span className="text-gray-300">{'★'.repeat(5 - review.stars)}</span>
      </span>
    </div>
    {review.comment && <p className="text-sm text-gray-700 mt-1">{review.comment}</p>}
    <p className="text-xs text-gray-400 mt-1">
      {new Date(review.createdAt).toLocaleDateString()}
    </p>
  </div>
);

export default ReviewCard;

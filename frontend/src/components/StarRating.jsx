import React, { useState } from 'react';

const StarRating = ({ rating = 0, interactive = false, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive ? (hoverRating || rating) : rating;

  return (
    <div style={{ display: 'inline-flex', gap: '2px', cursor: interactive ? 'pointer' : 'default' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{ 
            color: star <= displayRating ? '#f59e0b' : '#e5e7eb',
            fontSize: '1.25rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};
export default StarRating;

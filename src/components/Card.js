import React from 'react';
import PropTypes from 'prop-types';

const Card = React.memo(({ image, onClick, isFlipped }) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      className="card"
      onClick={onClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label="Memory card"
    >
      {isFlipped ? (
        <img src={image.src} alt="Memory card" />
      ) : (
        <div className="card-back">?</div>
      )}
    </div>
  );
});

Card.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isFlipped: PropTypes.bool.isRequired,
};

export default Card;

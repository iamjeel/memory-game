import React, { useState, useEffect, useCallback } from 'react';
import Card from './components/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [cachedImages, setCachedImages] = useState({}); // Cache for images per level
  const [isComplete, setIsComplete] = useState(false);

  // Load audio files
  const clickSound = new Audio('/sounds/click.wav');
  const matchSound = new Audio('/sounds/match.wav');
  const noMatchSound = new Audio('/sounds/unmatch.wav');
  const levelCompleteSound = new Audio('/sounds/complete.wav');

  useEffect(() => {
    if (cachedImages[level]) {
      // Use cached images if they exist
      setCards(cachedImages[level]);
    } else {
      fetchImages();
    }
  }, [level]);

  const fetchImages = async () => {
    setIsLoading(true);

    try {
      const imageUrls = Array.from({ length: 6 }, (_, index) => ({
        id: index,
        src: `https://picsum.photos/200?random=${index + level * 6}`, // Fetching random images from Lorem Picsum
      }));

      const shuffledCards = [...imageUrls, ...imageUrls]
        .map((img, index) => ({ id: index, src: img.src }))
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setCachedImages((prev) => ({ ...prev, [level]: shuffledCards })); // Cache images for this level
      setIsComplete(false);
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = useCallback(
    (card) => {
      // Play click sound on card click
      clickSound.play();

      if (flippedCards.length === 2 || matchedCards.includes(card.src) || flippedCards.includes(card)) return;

      setFlippedCards((prev) => [...prev, card]);

      if (flippedCards.length === 1) {
        const [firstCard] = flippedCards;

        if (firstCard.src === card.src) {
          setMatchedCards((prev) => [...prev, firstCard.src]);

          // Play match sound if cards match
          matchSound.play();

          if (matchedCards.length + 1 === cards.length / 2) {
            setIsComplete(true);
            // Play level completion sound
            levelCompleteSound.play();
            setTimeout(() => {
              setLevel((prevLevel) => prevLevel + 1);
              setMatchedCards([]);
              setFlippedCards([]);
            }, 1000);
          }
        } else {
          // Play no-match sound if cards don't match
          noMatchSound.play();
        }

        setTimeout(() => setFlippedCards([]), 1000);
      }
    },
    [flippedCards, matchedCards, cards.length]
  );

  useEffect(() => {
    let timeout;
    if (flippedCards.length === 2) {
      timeout = setTimeout(() => setFlippedCards([]), 1000);
    }

    return () => clearTimeout(timeout);
  }, [flippedCards]);

  const handleRefresh = () => {
    setCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    fetchImages();
  };

  return (
    <div className="app container text-center">
      <header className="app-header mb-4">
        <h1 className="game-title">Flip & Match</h1>
        <h2 className="game-level">Level {level}</h2>
        {isComplete && <p>Level Complete!</p>}
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </header>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="game-board row no-gutters">
          {cards.map((card) => (
            <div key={card.id} className="col-4">
              <Card
                image={card}
                onClick={() => handleCardClick(card)}
                isFlipped={flippedCards.includes(card) || matchedCards.includes(card.src)}
              />
            </div>
          ))}
        </div>
      )}
      <footer className="app-footer mt-4">
        <p>&copy; AAK Studio 2024</p>
        <a
          href="https://buymeacoffee.com/iamjeel"
          target="_blank"
          rel="noopener noreferrer"
          className="coffee-link"
        >
          Buy us a Coffee if you liked playing the game!!
        </a>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from './components/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;


const App = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('Unsplash access key is missing.');
      return;
    }
    fetchImages();
  }, [level]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(UNSPLASH_API_URL, {
        params: { count: 6, query: 'cartoon, comic',
        },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });

      const shuffledCards = [...data, ...data]
        .map((img, index) => ({ id: index, src: img.urls.small }))
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setIsComplete(false);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = useCallback(
    (card) => {
      if (flippedCards.length === 2 || matchedCards.includes(card.src) || flippedCards.includes(card)) return;

      setFlippedCards((prev) => [...prev, card]);

      if (flippedCards.length === 1) {
        const [firstCard] = flippedCards;

        if (firstCard.src === card.src) {
          setMatchedCards((prev) => [...prev, firstCard.src]);

          if (matchedCards.length + 1 === cards.length / 2) {
            setIsComplete(true);
            setTimeout(() => {
              setLevel((prevLevel) => prevLevel + 1);
              setMatchedCards([]);
              setFlippedCards([]);
            }, 1000);
          }
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
        {isComplete}
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
      <a href="https://buymeacoffee.com/iamjeel" target="_blank" rel="noopener noreferrer" className="coffee-link"> Buy us a Coffee if you liked playing the game!!</a>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from './components/Card';
import './App.css';

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const App = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(1);  // Track current level
  const [isComplete, setIsComplete] = useState(false);  // Track level completion

  useEffect(() => {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('Unsplash access key is missing.');
      return;
    }
    fetchImages();
  }, [level]);  // Refresh images when the level changes

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(UNSPLASH_API_URL, {
        params: { count: 6,query: 'cartoon', },  // Fixed count of 6 cards
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

          // Check if all cards are matched
          if (matchedCards.length + 1 === cards.length / 2) {
            setIsComplete(true);
            setTimeout(() => {
              setLevel((prevLevel) => prevLevel + 1);  // Move to the next level
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
    fetchImages();  // Fetch new images for the current level
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Memory Tester</h1>
        <h2>Level {level}</h2>
        {isComplete}
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </header>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="game-board">
          {cards.map((card) => (
            <Card
              key={card.id}
              image={card}
              onClick={() => handleCardClick(card)}
              isFlipped={flippedCards.includes(card) || matchedCards.includes(card.src)}
            />
          ))}
        </div>
      )}
          <footer className="app-footer">
      <p>By Aak Studio 2024</p>
    </footer>
    </div>
  );
};

export default App;

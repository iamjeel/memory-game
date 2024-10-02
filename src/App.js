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

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get(UNSPLASH_API_URL, {
        params: { count: 6 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });

      const shuffledCards = [...data, ...data]
        .map((img, index) => ({ id: index, src: img.urls.small }))
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleCardClick = useCallback((card) => {
    if (flippedCards.length < 2 && !matchedCards.includes(card.src) && !flippedCards.includes(card)) {
      setFlippedCards((prev) => [...prev, card]);

      if (flippedCards.length === 1) {
        const [firstCard] = flippedCards;

        if (firstCard.src === card.src) {
          setMatchedCards((prev) => [...prev, firstCard.src]);
        }

        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  }, [flippedCards, matchedCards]);

  const handleRefresh = () => {
    setCards([]); // Clear current cards
    setFlippedCards([]); // Reset flipped cards
    setMatchedCards([]); // Reset matched cards
    fetchImages(); // Fetch new images
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Memory Card Game</h1>
        <button className="refresh-button" onClick={handleRefresh}>Refresh</button>
      </header>
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
    </div>
  );
};

export default App;

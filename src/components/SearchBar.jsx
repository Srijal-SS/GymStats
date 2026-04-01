import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [muscle, setMuscle] = useState('');

  const muscles = [
    '', 'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 
    'chest', 'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 
    'middle back', 'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || muscle) {
      onSearch(searchTerm, muscle);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
      <input 
        type="text" 
        placeholder="Search exercises (e.g. squat, deadlift)" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
      />
      <select 
        value={muscle} 
        onChange={(e) => setMuscle(e.target.value)}
        style={{ flex: '1 1 150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', textTransform: 'capitalize' }}
      >
        <option value="">All Muscles</option>
        {muscles.filter(m => m !== '').map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <button 
        type="submit"
        style={{ flex: '0 1 auto', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;

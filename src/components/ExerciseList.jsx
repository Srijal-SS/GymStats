import React from 'react';
import ExerciseCard from './ExerciseCard';

function ExerciseList({ exercises, isLoading, error, onAddToLog }) {
  if (isLoading) {
    return <div className="loader">Searching exercises...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (exercises.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
        No exercises found right now. Try searching for "squat" or filtering by muscle!
      </div>
    );
  }

  return (
    <div className="grid grid-2 grid-3 grid-4">
      {exercises.map((exercise) => (
        <ExerciseCard 
          key={exercise.id || exercise.name} 
          exercise={exercise} 
          onAddToLog={onAddToLog}
        />
      ))}
    </div>
  );
}

export default ExerciseList;

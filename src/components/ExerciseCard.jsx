import React from 'react';

function ExerciseCard({ exercise, onAddToLog }) {
  // RapidAPI ExerciseDB shape: { id, name, target, equipment, gifUrl, bodyPart }
  return (
    <div className="exercise-card" style={{ 
      background: 'var(--card-bg)', 
      borderRadius: 'var(--radius)', 
      overflow: 'hidden', 
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out'
    }}>
      <img 
        src={exercise.gifUrl} 
        alt={exercise.name} 
        loading="lazy"
        style={{ width: '100%', height: '250px', objectFit: 'contain', background: 'white' }} 
      />
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', textTransform: 'capitalize', color: 'var(--text-main)' }}>
          {exercise.name}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
          <strong>Target:</strong> {exercise.target}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
          <strong>Equipment:</strong> {exercise.equipment}
        </p>
        <button 
          onClick={() => onAddToLog(exercise.name)}
          style={{ 
            marginTop: 'auto', 
            padding: '0.5rem', 
            borderRadius: '6px', 
            border: 'none', 
            background: 'var(--primary)', 
            color: 'white', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}>
          Log Workout
        </button>
      </div>
    </div>
  );
}

export default ExerciseCard;

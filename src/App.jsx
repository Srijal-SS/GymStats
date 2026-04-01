import React, { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ExerciseList from './components/ExerciseList';
import WorkoutLog from './components/WorkoutLog';

function App() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');

  const fetchExercises = async (searchTerm, muscle) => {
    setIsLoading(true);
    setError(null);

    try {
      // Setup the options for RapidAPI ExerciseDB
      const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
      if (!apiKey || apiKey === 'your_rapidapi_key_here') {
        throw new Error("Missing RapidAPI Key. Please add it to the .env file.");
      }

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      };

      let url = 'https://exercisedb.p.rapidapi.com/exercises?limit=12';
      
      // If we have a search term, use the name endpoint
      if (searchTerm) {
        url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchTerm.toLowerCase())}?limit=50`;
      } else if (muscle) {
        url = `https://exercisedb.p.rapidapi.com/exercises/target/${encodeURIComponent(muscle)}?limit=12`;
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error("Invalid API Key or unauthorized.");
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Try again later.");
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      let data = await response.json();
      
      // Filter out by muscle if both searchTerm and muscle were provided
      if (searchTerm && muscle) {
        data = data.filter(ex => ex.target === muscle);
      }
      
      // Only keep the first 12 results to keep it simple
      setExercises(data.slice(0, 12));
    } catch (err) {
      console.error(err);
      setError(err.message);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLog = (exerciseName) => {
    setSelectedExercise(exerciseName);
  };

  return (
    <div className="app-container">
      <Header />
      
      <main>


        <section style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <div className="section-title">Workout Log</div>
          <WorkoutLog initialExercise={selectedExercise} />
        </section>

        <section>
          <div className="section-title">Search Exercises</div>
          <SearchBar onSearch={fetchExercises} />
          <ExerciseList 
            exercises={exercises} 
            isLoading={isLoading} 
            error={error} 
            onAddToLog={handleAddToLog}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';

function WorkoutLog({ initialExercise = '' }) {
  const [workouts, setWorkouts] = useState([]);
  const [exerciseName, setExerciseName] = useState(initialExercise);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rpe, setRpe] = useState('');
  const [note, setNote] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  
  const formRef = useRef(null);

  useEffect(() => {
    if (initialExercise) {
      setExerciseName(initialExercise);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialExercise]);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!exerciseName || !sets || !reps || !weight) return;

    const volume = parseInt(sets, 10) * parseInt(reps, 10) * parseFloat(weight);
    
    const newWorkout = {
      id: Date.now(),
      exerciseName,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight),
      volume: isNaN(volume) ? 0 : volume,
      date: date || new Date().toISOString().split('T')[0],
      rpe: rpe ? parseFloat(rpe) : '',
      note: note.trim()
    };

    setWorkouts([newWorkout, ...workouts]);
    
    // Reset inputs but keep date
    setSets('');
    setReps('');
    setWeight('');
    setRpe('');
    setNote('');
  };

  const handleAnalyzeWorkout = async () => {
    if (workouts.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
      }

      // Format CSV
      let csv = "Exercise,Date,Workout,Sets,Reps,Weight (kg),RPE,Volume,Notes\n";
      workouts.forEach(w => {
        csv += `"${w.exerciseName}","${w.date}","Gym Workout",${w.sets},${w.reps},${w.weight},${w.rpe},${w.volume},"${w.note}"\n`;
      });

      const prompt = `You are my AI gym coach and training data analyst.

Context (do NOT assume anything outside this):
- I log my workouts in Notion and export CSV files.
- One row = one exercise.
- Columns include:
Exercise, Date, Workout, Sets, Reps, Weight (kg), RPE, Volume, Notes.
- The CSV I upload is already filtered (daily or weekly).

Your task:
1. Analyze the uploaded CSV strictly based on the data provided.
2. Evaluate:
- Progressive overload
- Volume trends
- Intensity (via RPE and load)
- Exercise consistency
- Fatigue or recovery signals
3. Detect TRUE PRs:
- Same reps, higher weight
- Same weight, more reps
- Estimated 1RM improvements
- Volume PRs
4. Identify:
- Plateaus
- Undertraining
- Overreaching
5. Give clear, actionable recommendations:
- What to increase (weight / reps / sets)
- What to keep the same
- What to reduce or deload
6. Generate graphs if the data spans multiple sessions or weeks.

Rules:
- Do NOT invent or assume missing data.
- Do NOT give generic fitness advice.
- Be evidence-based and conservative.
- Prefer long-term progress over ego lifting.
- If the CSV is daily: analyze session quality only.
- If the CSV is weekly: analyze trends and progression.
- If I am writing numbers at the end of the exercise the means I am doing drop set without rest. for example if I wrote Exercise 1, Exercise 2 and Exercise 3 it means I did one drop set of  Exercise three times gradually reducing weight.

Now analyze the uploaded CSV:
${csv}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get analysis from Gemini API.");
      }

      const data = await response.json();
      setAnalysisResult(data.candidates[0].content.parts[0].text);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div ref={formRef} className="workout-log" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
      <form onSubmit={handleAddWorkout} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', marginBottom: '2rem' }}>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          required
        />
        <input 
          type="text" 
          placeholder="Exercise Name" 
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          required
        />
        <input 
          type="number" 
          placeholder="Sets" 
          value={sets}
          min="1"
          onChange={(e) => setSets(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          required
        />
        <input 
          type="number" 
          placeholder="Reps" 
          value={reps}
          min="1"
          onChange={(e) => setReps(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          required
        />
        <input 
          type="number" 
          step="0.5"
          placeholder="Weight (kg/lbs)" 
          value={weight}
          min="0"
          onChange={(e) => setWeight(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          required
        />
        <input 
          type="number" 
          step="0.5"
          placeholder="RPE (Optional)" 
          value={rpe}
          min="1"
          max="10"
          onChange={(e) => setRpe(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
        <input 
          type="text" 
          placeholder="Notes (Drop sets, etc. Optional)" 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}
        />
        <button 
          type="submit"
          style={{ padding: '0.75rem', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', gridColumn: '1 / -1' }}
        >
          Add Workout
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}>Recent Workouts</h3>
        <button 
          onClick={handleAnalyzeWorkout}
          disabled={workouts.length === 0 || isAnalyzing}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: (workouts.length === 0 || isAnalyzing) ? 'not-allowed' : 'pointer', opacity: (workouts.length === 0 || isAnalyzing) ? 0.6 : 1 }}
        >
          {isAnalyzing ? 'Analyzing...' : '🤖 Analyze Workout'}
        </button>
      </div>

      {analysisError && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {analysisError}
        </div>
      )}

      {analysisResult && (
        <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--primary)', marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>AI Analysis Result</h4>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
            {analysisResult}
          </div>
        </div>
      )}

      <div className="workout-list">
        {workouts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No workouts logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {workouts.map(workout => (
              <div key={workout.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-color)', textTransform: 'capitalize' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{workout.exerciseName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {workout.date}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {workout.sets} sets × {workout.reps} reps @ {workout.weight} units {workout.rpe ? `| RPE: ${workout.rpe}` : ''}
                  </div>
                  {workout.note && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Note: {workout.note}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    Vol: {workout.volume}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutLog;

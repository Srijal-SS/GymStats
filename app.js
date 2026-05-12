const RAPIDAPI_KEY = 'e072fe928amsh48f4d59ab993b63p171142jsn5aa4f704aa4b';

let exercises = [];
let workouts = [];

fetch('http://localhost:3000/api/workouts')
  .then(res => res.json())
  .then(data => {
    workouts = data;
    renderWorkouts();
  });

function saveWorkouts() {
  fetch('http://localhost:3000/api/workouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workouts, null, 2)
  });
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const term = document.getElementById('search-input').value.toLowerCase();
  const muscle = document.getElementById('muscle-select').value;
  
  if (!term && !muscle) return;

  document.getElementById('exercise-loader').classList.remove('hidden');
  document.getElementById('exercise-empty').classList.add('hidden');
  document.getElementById('exercise-list-container').innerHTML = '';

  let url = 'https://exercisedb.p.rapidapi.com/exercises?limit=12';
  if (term) {
    url = `https://exercisedb.p.rapidapi.com/exercises/name/${term}?limit=50`;
  } else if (muscle) {
    url = `https://exercisedb.p.rapidapi.com/exercises/target/${muscle}?limit=12`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com' }
    });
    
    let data = await res.json();
    
    if (term && muscle) {
      data = data.filter(ex => ex.target === muscle);
    }
    
    exercises = data.slice(0, 12);
    
    if (exercises.length === 0) {
      document.getElementById('exercise-empty').classList.remove('hidden');
    } else {
      renderExercises();
    }
  } catch (err) {
    alert("Could not load exercises. Check API key.");
  }
  
  document.getElementById('exercise-loader').classList.add('hidden');
});

document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  document.getElementById('muscle-select').value = '';
  document.getElementById('exercise-list-container').innerHTML = '';
  document.getElementById('exercise-empty').classList.remove('hidden');
});

function renderExercises() {
  const container = document.getElementById('exercise-list-container');
  
  container.innerHTML = exercises.map(ex => `
    <div class="bg-slate-800 rounded-lg shadow-md p-4 flex flex-col">
      <img src="${ex.gifUrl}" class="w-full h-48 object-cover bg-white mb-4 rounded" />
      <h3 class="text-lg font-bold text-slate-100 capitalize">${ex.name}</h3>
      <p class="text-xs text-sky-300 uppercase mb-4">${ex.bodyPart} - ${ex.target}</p>
      
      <button onclick="setExerciseName('${ex.name.replace(/'/g, "\\'")}')" class="mt-auto py-2 bg-slate-700 text-white rounded">
        Log Workout
      </button>
    </div>
  `).join('');
}

window.setExerciseName = (name) => {
  const wExercise = document.getElementById('w-exercise');
  wExercise.value = name;
  wExercise.focus();
};

document.getElementById('w-date').value = new Date().toISOString().split('T')[0];

document.getElementById('workout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const sets = parseInt(document.getElementById('w-sets').value);
  const reps = parseInt(document.getElementById('w-reps').value);
  const weight = parseFloat(document.getElementById('w-weight').value);
  
  const newWorkout = {
    id: Date.now(),
    exerciseName: document.getElementById('w-exercise').value,
    sets: sets,
    reps: reps,
    weight: weight,
    volume: (sets * reps * weight) || 0,
    date: document.getElementById('w-date').value,
    rpe: document.getElementById('w-rpe').value,
    note: document.getElementById('w-notes').value
  };

  workouts.unshift(newWorkout);
  
  saveWorkouts();
  renderWorkouts();
  
  document.getElementById('w-sets').value = '';
  document.getElementById('w-reps').value = '';
  document.getElementById('w-weight').value = '';
  document.getElementById('w-rpe').value = '';
  document.getElementById('w-notes').value = '';
});

const sortSelect = document.getElementById('sort-date-select');
if (sortSelect) {
  sortSelect.addEventListener('change', renderWorkouts);
}

function renderWorkouts() {
  const list = document.getElementById('workout-list');
  const emptyMsg = document.getElementById('no-workouts-msg');
  
  if (workouts.length === 0) {
    emptyMsg.classList.remove('hidden');
    list.innerHTML = '';
    return;
  }
  
  emptyMsg.classList.add('hidden');
  
  const sortOrder = sortSelect ? sortSelect.value : 'desc';
  const displayWorkouts = [...workouts].sort((a, b) => {
    const dateA = a.date || ""; 
    const dateB = b.date || "";
    
    if (sortOrder === 'asc') {
      const cmp = dateA.localeCompare(dateB);
      return cmp !== 0 ? cmp : a.id - b.id;
    } else {
      const cmp = dateB.localeCompare(dateA);
      return cmp !== 0 ? cmp : b.id - a.id;
    }
  });

  list.innerHTML = displayWorkouts.map(w => `
    <div class="flex justify-between items-center p-4 border border-slate-700 rounded-lg bg-slate-900/50 capitalize">
      <div class="flex flex-col gap-1">
        <div>
          <strong class="text-lg text-slate-100">${w.exerciseName}</strong>
          <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded ml-2">${w.date}</span>
        </div>
        <div class="text-sm text-slate-400">
          ${w.sets} sets × ${w.reps} reps @ ${w.weight} units ${w.rpe ? `| RPE: ${w.rpe}` : ''}
        </div>
        ${w.note ? `<div class="text-xs text-slate-500 italic">Note: ${w.note}</div>` : ''}
      </div>
      
      <div class="text-right flex flex-col items-end gap-2">
        <div class="font-bold text-sky-400">Vol: ${w.volume}</div>
        <button onclick="deleteWorkout(${w.id})" class="text-xs text-red-500 hover:text-red-400 uppercase font-bold">Delete</button>
      </div>
    </div>
  `).join('');
}

window.deleteWorkout = (id) => {
  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts();
  renderWorkouts();
};

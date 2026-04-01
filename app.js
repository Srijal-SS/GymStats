const RAPIDAPI_KEY = 'e072fe928amsh48f4d59ab993b63p171142jsn5aa4f704aa4b';

let exercises = [];

let workouts = JSON.parse(localStorage.getItem('gymstats_workouts')) || [];

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const muscleSelect = document.getElementById('muscle-select');
const clearBtn = document.getElementById('clear-btn');
const exerciseListContainer = document.getElementById('exercise-list-container');
const exerciseLoader = document.getElementById('exercise-loader');
const exerciseError = document.getElementById('exercise-error');
const exerciseEmpty = document.getElementById('exercise-empty');

const workoutForm = document.getElementById('workout-form');
const wDate = document.getElementById('w-date');
const wExercise = document.getElementById('w-exercise');
const wSets = document.getElementById('w-sets');
const wReps = document.getElementById('w-reps');
const wWeight = document.getElementById('w-weight');
const wRpe = document.getElementById('w-rpe');
const wNotes = document.getElementById('w-notes');

const workoutList = document.getElementById('workout-list');
const noWorkoutsMsg = document.getElementById('no-workouts-msg');

wDate.value = new Date().toISOString().split('T')[0];

wExercise.addEventListener('focus', () => {
    wExercise.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const term = searchInput.value.trim().toLowerCase();
  const muscle = muscleSelect.value;
  if (!term && !muscle) return;

  exerciseLoader.classList.remove('hidden');
  exerciseError.classList.add('hidden');
  exerciseEmpty.classList.add('hidden');
  exerciseListContainer.innerHTML = '';
  
  try {
    if (!RAPIDAPI_KEY) throw new Error("Missing RapidAPI Key");

    let url = 'https://exercisedb.p.rapidapi.com/exercises?limit=12';
    if (term) url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(term)}?limit=50`;
    else if (muscle) url = `https://exercisedb.p.rapidapi.com/exercises/target/${encodeURIComponent(muscle)}?limit=12`;

    const res = await fetch(url, {
      headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com' }
    });

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    let data = await res.json();
    
    if (term && muscle) data = data.filter(ex => ex.target === muscle);
    exercises = data.slice(0, 12);
    
    if (exercises.length === 0) {
      exerciseEmpty.classList.remove('hidden');
    } else {
      renderExercises();
    }
  } catch (err) {
    exerciseError.textContent = err.message;
    exerciseError.classList.remove('hidden');
  } finally {
    exerciseLoader.classList.add('hidden');
  }
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  muscleSelect.value = '';
  exerciseListContainer.innerHTML = '';
  exerciseError.classList.add('hidden');
  exerciseEmpty.classList.remove('hidden');
});

function renderExercises() {
  exerciseListContainer.innerHTML = exercises.map(ex => `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <img src="${ex.gifUrl}" alt="${ex.name}" class="w-full h-48 object-cover object-center bg-white" loading="lazy" />
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-lg font-bold capitalize text-slate-800 mb-2">${ex.name}</h3>
        <div class="flex flex-wrap gap-2 mb-4">
           <span class="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded uppercase font-semibold">${ex.bodyPart}</span>
           <span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded uppercase font-semibold">${ex.target}</span>
        </div>
        <div class="mt-auto">
          <button onclick="setExerciseName('${ex.name.replace(/'/g, "\\'")}')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors">
            Log Workout
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.setExerciseName = (name) => {
  wExercise.value = name;
  wExercise.focus();
};

workoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const vSets = parseInt(wSets.value, 10);
  const vReps = parseInt(wReps.value, 10);
  const vWeight = parseFloat(wWeight.value);
  const volume = vSets * vReps * vWeight;
  
  const workout = {
    id: Date.now(),
    exerciseName: wExercise.value,
    sets: vSets,
    reps: vReps,
    weight: vWeight,
    volume: isNaN(volume) ? 0 : volume,
    date: wDate.value || new Date().toISOString().split('T')[0],
    rpe: wRpe.value ? parseFloat(wRpe.value) : '',
    note: wNotes.value.trim()
  };

  workouts.unshift(workout);
  

  localStorage.setItem('gymstats_workouts', JSON.stringify(workouts));
  
  wSets.value = ''; wReps.value = ''; wWeight.value = ''; wRpe.value = ''; wNotes.value = '';

  renderWorkouts();
});

function renderWorkouts() {
  if (workouts.length === 0) {
    noWorkoutsMsg.classList.remove('hidden');
    workoutList.innerHTML = '';
    return;
  }
  
  noWorkoutsMsg.classList.add('hidden');
  workoutList.innerHTML = workouts.map(w => `
    <div class="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-slate-50 capitalize">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <strong class="text-lg">${w.exerciseName}</strong>
          <span class="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">${w.date}</span>
        </div>
        <div class="text-sm text-slate-600">
          ${w.sets} sets × ${w.reps} reps @ ${w.weight} units ${w.rpe ? `| RPE: ${w.rpe}` : ''}
        </div>
        ${w.note ? `<div class="text-sm text-slate-500 italic">Note: ${w.note}</div>` : ''}
      </div>
      <div class="text-right flex flex-col items-end gap-2">
        <div class="font-bold text-sky-500">Vol: ${w.volume}</div>
        <button onclick="deleteWorkout(${w.id})" class="text-xs text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">Delete</button>
      </div>
    </div>
  `).join('');
}

window.deleteWorkout = (id) => {
  workouts = workouts.filter(w => w.id !== id);
  
  localStorage.setItem('gymstats_workouts', JSON.stringify(workouts));
  renderWorkouts();
};

renderWorkouts();

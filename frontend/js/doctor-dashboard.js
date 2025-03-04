const API_URL = 'http://localhost:5000/api';

// Проверка авторизации
if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const dateSelect = document.getElementById('dateSelect');
const scheduleTableBody = document.getElementById('scheduleTableBody');

// Установка сегодняшней даты
const today = new Date();
dateSelect.value = today.toISOString().split('T')[0];

// Загрузка расписания
async function loadSchedule(date) {
    try {
        const response = await fetch(`${API_URL}/appointments/${date}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        renderSchedule(data.appointments, data.blockedTimes);
    } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);
    }
}

// Отрисовка расписания
function renderSchedule(appointments, blockedTimes) {
    scheduleTableBody.innerHTML = '';
    
    const timeSlots = [
        '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    timeSlots.forEach(time => {
        const appointment = appointments.find(a => a.time === time);
        const isBlocked = blockedTimes.some(b => b.time === time);
        
        const row = document.createElement('tr');
        if (isBlocked) row.classList.add('blocked');
        if (appointment) row.classList.add('occupied');
        
        const currentLang = localStorage.getItem('preferred-language') || 'ru';
        
        row.innerHTML = `
            <td class="time-slot">${time}</td>
            <td>${appointment ? appointment.patientName : '-'}</td>
            <td>${appointment ? appointment.phoneNumber : '-'}</td>
            <td class="action-buttons">
                ${!appointment && !isBlocked ?
                    `<button onclick="blockTime('${time}')" class="btn secondary" data-lang="block">
                        ${translations[currentLang].block}
                    </button>` :
                    isBlocked ?
                    `<button onclick="unblockTime('${time}')" class="btn primary" data-lang="unblock">
                        ${translations[currentLang].unblock}
                    </button>` :
                    '-'
                }
            </td>
        `;
        
        scheduleTableBody.appendChild(row);
    });
}

// Блокировка времени
async function blockTime(time) {
    try {
        const response = await fetch(`${API_URL}/appointments/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                date: dateSelect.value,
                time
            })
        });

        if (response.ok) {
            loadSchedule(dateSelect.value);
        }
    } catch (error) {
        console.error('Ошибка при блокировке времени:', error);
    }
}

// Разблокировка времени
async function unblockTime(time) {
    try {
        const blockedTime = await getBlockedTimeId(dateSelect.value, time);
        if (!blockedTime) return;

        const response = await fetch(`${API_URL}/appointments/block/${blockedTime._id}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            loadSchedule(dateSelect.value);
        }
    } catch (error) {
        console.error('Ошибка при разблокировке времени:', error);
    }
}

// Навигация по дням
function previousDay() {
    const date = new Date(dateSelect.value);
    date.setDate(date.getDate() - 1);
    dateSelect.value = date.toISOString().split('T')[0];
    loadSchedule(dateSelect.value);
}

function nextDay() {
    const date = new Date(dateSelect.value);
    date.setDate(date.getDate() + 1);
    dateSelect.value = date.toISOString().split('T')[0];
    loadSchedule(dateSelect.value);
}

// Выход
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Обработчики событий
dateSelect.addEventListener('change', (e) => {
    loadSchedule(e.target.value);
});

// Загрузка начального расписания
loadSchedule(dateSelect.value);

async function getBlockedTimeId(date, time) {
    try {
        const response = await fetch(`${API_URL}/appointments/${date}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const data = await response.json();
        return data.blockedTimes.find(b => b.time === time);
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
} 
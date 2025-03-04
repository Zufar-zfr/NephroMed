const API_URL = 'http://localhost:5000/api';
const timeSlots = [
    '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Модальное окно
const modal = document.getElementById('appointmentModal');
const closeBtn = document.getElementsByClassName('close')[0];

// Функция открытия модального окна
function showAppointmentForm() {
    modal.style.display = 'flex';
    populateTimeSlots();
    updateAvailableTimeSlots(); // Добавляем проверку доступного времени при открытии
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Заполнение временных слотов
function populateTimeSlots() {
    const timeSelect = document.getElementById('appointmentTime');
    const currentLang = localStorage.getItem('preferred-language') || 'ru';
    
    timeSelect.innerHTML = '';
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = `🟢 ${time}`;
        option.className = 'time-available';
        timeSelect.appendChild(option);
    });
}

// Установка минимальной даты
const dateInput = document.getElementById('appointmentDate');
const today = new Date();
dateInput.min = today.toISOString().split('T')[0];

// Обработка формы записи
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = localStorage.getItem('preferred-language') || 'ru';

    const formData = {
        patientName: document.getElementById('patientName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value
    };

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(translations[currentLang]['appointment-success']);
            modal.style.display = 'none';
            document.getElementById('appointmentForm').reset();
        } else {
            alert(data.message || translations[currentLang]['appointment-error']);
        }
    } catch (error) {
        alert(translations[currentLang]['appointment-error']);
    }
});

// Добавим стили для недоступного времени
function updateAvailableTimeSlots() {
    const date = document.getElementById('appointmentDate').value;
    const timeSelect = document.getElementById('appointmentTime');
    const currentLang = localStorage.getItem('preferred-language') || 'ru';

    if (!date) return;

    fetch(`${API_URL}/appointments/${date}`)
        .then(response => response.json())
        .then(data => {
            timeSelect.innerHTML = ''; // Очищаем список

            timeSlots.forEach(time => {
                const option = document.createElement('option');
                const isOccupied = data.appointments.some(app => app.time === time);
                const isBlocked = data.blockedTimes.some(block => block.time === time);

                // Объединяем занятое и заблокированное время
                if (isOccupied || isBlocked) {
                    option.value = time;
                    option.textContent = `🔴 ${time} (${translations[currentLang]['time-occupied']})`;
                    option.disabled = true;
                    option.className = 'time-occupied';
                } else {
                    option.value = time;
                    option.textContent = `🟢 ${time}`;
                    option.className = 'time-available';
                }

                timeSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Ошибка:', error));
}

// Добавляем обработчик изменения даты
document.getElementById('appointmentDate').addEventListener('change', updateAvailableTimeSlots);

// Добавим функцию переключения языков в начало файла
function changeLanguage(lang) {
    // Обновляем активную кнопку
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${lang}-btn`).classList.add('active');

    // Обновляем все переводимые элементы
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName.toLowerCase() === 'input' && element.type === 'submit') {
                element.value = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Сохраняем выбор языка
    localStorage.setItem('preferred-language', lang);
}

// Устанавливаем язык при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'ru';
    changeLanguage(savedLanguage);
});

// Обработка аккордеона
document.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const isActive = button.classList.contains('active');

        // Закрываем все активные аккордеоны
        document.querySelectorAll('.accordion-button').forEach(btn => {
            btn.classList.remove('active');
            btn.nextElementSibling.classList.remove('active');
        });

        // Открываем текущий аккордеон, если он был закрыт
        if (!isActive) {
            button.classList.add('active');
            content.classList.add('active');
        }
    });
}); 
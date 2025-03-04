const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const BlockedTime = require('../models/BlockedTime');
const auth = require('../middleware/auth');

// Получить все записи на определенную дату
router.get('/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(date.setHours(0,0,0)),
        $lt: new Date(date.setHours(23,59,59))
      }
    });
    const blockedTimes = await BlockedTime.find({
      date: {
        $gte: new Date(date.setHours(0,0,0)),
        $lt: new Date(date.setHours(23,59,59))
      }
    });
    res.json({ appointments, blockedTimes });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новую запись
router.post('/', async (req, res) => {
  try {
    const { patientName, phoneNumber, date, time } = req.body;
    
    // Проверка на выходные
    const appointmentDate = new Date(date);
    if (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
      return res.status(400).json({ message: 'Записи на выходные недоступны' });
    }

    // Проверка на существующие записи
    const existingAppointment = await Appointment.findOne({ date, time });
    const blockedTime = await BlockedTime.findOne({ date, time });

    if (existingAppointment || blockedTime) {
      return res.status(400).json({ message: 'Это время уже занято' });
    }

    const appointment = new Appointment({
      patientName,
      phoneNumber,
      date,
      time
    });

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Заблокировать время (только для доктора)
router.post('/block', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const blockedTime = new BlockedTime({ date, time });
    await blockedTime.save();
    res.json(blockedTime);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Разблокировать время (только для доктора)
router.delete('/block/:id', auth, async (req, res) => {
  try {
    await BlockedTime.findByIdAndDelete(req.params.id);
    res.json({ message: 'Время разблокировано' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router; 
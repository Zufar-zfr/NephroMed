const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createDoctor() {
    try {
        console.log('Trying to connect to:', process.env.MONGODB_URI); // Добавим для отладки
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI не найден в переменных окружения');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        
        // Проверяем, существует ли уже доктор
        const existingDoctor = await User.findOne({ username: 'qwe' });
        if (existingDoctor) {
            console.log('Доктор уже существует в базе данных');
            return;
        }

        const password = await bcrypt.hash('450wi59k', 10);
        
        const doctor = new User({
            username: 'Farida',
            password: password,
            role: 'doctor'
        });

        await doctor.save();
        console.log('Доктор успешно создан!');
        console.log('Логин: doctor');
        console.log('Пароль: doctor123');
        
    } catch (error) {
        console.error('Ошибка при создании доктора:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createDoctor(); 
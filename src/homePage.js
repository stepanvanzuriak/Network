import React from 'react';
import { Link } from 'react-router-dom';

import './homePage.scss';
import Logo from './Emblema.gif';

const HomePage = () => (
    <div className="home-wrap">
        <div className="header">
            <img src={Logo} alt="logo" />
        </div>
        <div className="content">
            <h3>Чернівецький національний університет імені Юрія Федьковича</h3>
            <h3>Кафедра математичних проблем управління і кібернетики</h3>
            <h3>Дисципліна: Мережі та потоки</h3>
            <h3>Тема: Знаходження максимального потоку на мережі методом Форда-Фалкерсона</h3>
            <h3>Автори програми:</h3>
            <h3>Попович Костянтин, Ванзуряк Степан, Полицький Олег, Зуєв Олег, Скавренюк Андрій</h3>
            <h3>Керівник роботи: Доцент, канд. фіз.-мат. наук Руснак Микола Андрійович</h3>
            <Link to="/graph">
                <button>Перейти на сторінку виконання програми</button>
            </Link>
        </div>
        <div className="footer"><h3>2019</h3></div>
    </div>
);

export default HomePage;
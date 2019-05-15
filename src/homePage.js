import React from 'react';
import { Link } from 'react-router-dom';

import './homePage.scss';
import Logo from './Emblema.gif';

const HomePage = () => (
    <div className="wrap">
        <div className="header">
            <img src={Logo} alt="logo" />
        </div>
        <div className="content">
            <h1></h1>
            <Link to="/graph">
                <button>Перейти на сторінку </button>
            </Link>
        </div>
        <div className="footer">Footer</div>
    </div>
);

export default HomePage;
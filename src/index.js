import Application from './javascript/Application.js';
import './style/main.css';
import './style/loading.css';
import './style/label.css';

window.application = new Application({
    $canvas: document.querySelector('.webgl'),
});

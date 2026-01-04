
import { render } from 'preact';
import { App } from './components/App';

const appRoot = document.getElementById('app');
if (appRoot) {
    render(<App />, appRoot);
}

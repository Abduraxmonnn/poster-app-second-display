import '../css/main.scss';
import React from 'react';
import ReactDOM from 'react-dom';

import MainApp from '../../examples/hello-world/app';

class ExampleApp extends React.Component {
    render() {
        // Чтобы отобразить нужный пример, просто закомментируйте не нужные компоненты

        return <MainApp />;
    }
}

ReactDOM.render(
    <ExampleApp />,
    document.getElementById('app-container'),
);

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
	palette: {
		primary: {
			light: '#8d98f2',
			main: '#5a6abf',
			dark: '#23408e'
		},
		secondary: {
			light: '#ffffff',
			main: '#fafafa',
			dark: '#c7c7c7',
		},
	},
});

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<App /> 
	</MuiThemeProvider>,
	document.getElementById('root') as HTMLElement
);
registerServiceWorker();

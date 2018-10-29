import * as React from 'react';
import './App.css';
import { TradeWindowGenerator, ITradeWindowGenProps } from './components/TradeWindowGenerator'

class App extends React.Component {
	public render() {
		let props: ITradeWindowGenProps = {
			verticalOptions: ['eth', 'btc'],
			horizontalOptions: ['ddd', 'eth']
		}
		return (
			<TradeWindowGenerator {...props} />
		);
	}
}

export default App;

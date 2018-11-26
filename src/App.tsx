import * as React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';
// import { UserStats, IUserStatsProps } from './components/UserStats'
import {TradeWindowGenerator, ITradeWindowGenProps} from './components/TradeWindowGenerator'

class App extends React.Component {
	public render() {
		// let props: IUserStatsProps = {
		// 	network: "Ropsten",
		// 	account: "0xabc124ffe2232cef",
		// 	name: "Hodor",
		// 	scarcityBalance: 7.233,
		// 	ethBalance: 0.05,
		// 	tokenBalances: [{
		// 		address: "0x960b236A07cf122663c4303350609A66A7B288C0",
		// 		name: "ANT",
		// 		balance: 112.8
		// 	}]
		// }
		let props:ITradeWindowGenProps = {
			verticalOptions:["dog","man"],
			horizontalOptions:["feeline","horse"]
		};
		return (
			<React.Fragment>
				<CssBaseline />
				{/* <UserStats {...props} /> */}
				<TradeWindowGenerator {...props} />
			</React.Fragment>
		);
	}
}

export default App;

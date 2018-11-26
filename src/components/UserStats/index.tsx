import * as React from 'react';
import './style.css';
import { withStyles } from '@material-ui/core';
// import { Add } from '@material-ui/icons';
import { createStyles } from '@material-ui/core';


const styles = createStyles({
	formControl: {
		minWidth: "140px",
	}
});

export interface ITokenBalance {
	address: string,
	name: string,
	balance: number
}

export interface IUserStatsProps {
	network: string,
	account: string,
	name: string,
	scarcityBalance: number,
	ethBalance: number,
	tokenBalances: ITokenBalance[]
	classes?: any
}

class userStats extends React.Component<IUserStatsProps, any>{
	public render() {
		//const { classes } = this.props;
		return (
			<div id="userStatsRoot">
				<div className="statsHeading"><h3>Your Stats</h3></div>
				<div className="quickBox">Medium and stuff</div>
				<div className="statsRows">
					some stats
				</div>
			</div>
		);
	}
}

export const UserStats = withStyles(styles)(userStats);
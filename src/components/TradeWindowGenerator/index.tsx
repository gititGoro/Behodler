import * as React from 'react';
import './style.css';
import { MenuItem, Button, withStyles, FormControl, Select } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { createStyles } from '@material-ui/core';

const styles = createStyles({
	formControl: {
		minWidth: "140px",
	}
});

export interface ITradeWindowGenProps {
	verticalOptions: string[],
	horizontalOptions: string[],
	horizontalSelection?: number,
	verticalSelection?: number,
	classes?: any
}

class tradeWindowGenerator extends React.Component<ITradeWindowGenProps, any>{
	public render() {
		const { classes } = this.props;
		return (
			<form className="tradeWindowGenForm">
				<fieldset className="tradeWindowGenFields">
					<div className="tradeWindowGen">
						<div className="header">
							<h3>Create a new trading window</h3>
						</div>
						<div className="controls">
							<div className="selectorCell">
								<div>Horizontal</div>
								<FormControl className={classes.formControl}>
									<Select>
										<MenuItem value={1}>Eth</MenuItem>
										<MenuItem value={2}>ANT</MenuItem>
										<MenuItem value={3}>DDD</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div className="selectorCell">
								<div>Vertical</div>
								<FormControl className={classes.formControl}>
									<Select>
										<MenuItem value={1}>Eth</MenuItem>
										<MenuItem value={2}>ANT</MenuItem>
										<MenuItem value={3}>DDD</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div className=" selectorCell">
								<Button variant="fab" color="secondary" aria-label="Add">
									<Add />
								</Button>
							</div>
						</div>
					</div>
				</fieldset>
			</form>
		);
	}
}

export const TradeWindowGenerator = withStyles(styles)(tradeWindowGenerator);
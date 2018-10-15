import * as constants from './constants';

import { Action } from 'redux';

export interface ITradingPageVerticalComboChange extends Action {
    type: constants.TRADINGPAGE_VERTICAL_COMBO_CHANGE;
    payload: {
        selectedValue: string
    }
}

export interface ITradingPageHorizontalComboChange extends Action {
    type: constants.TRADINGPAGE_HORIZONTAL_COMBO_CHANGE;
    payload: {
        selectedValue: string
    }
}

export interface ITradingPageCreateButtonClick extends Action {
    type: constants.TRADINGPAGE_CREATE_BUTTON_CLICK;
}

export type TradeWindowGenAction = ITradingPageCreateButtonClick | ITradingPageHorizontalComboChange| ITradingPageVerticalComboChange;

export function tradingPageVerticalChange(payload: ITradingPageVerticalComboChange["payload"]): ITradingPageVerticalComboChange {
    return {
        payload,
        type: constants.TRADINGPAGE_VERTICAL_COMBO_CHANGE
    }
}

export function tradingPageHorizontalChange(payload: ITradingPageHorizontalComboChange["payload"]): ITradingPageHorizontalComboChange {
    return {
        payload,
        type: constants.TRADINGPAGE_HORIZONTAL_COMBO_CHANGE
    }
}

export function tradingPageCreateButtonClick(): ITradingPageCreateButtonClick {
    return {
        type: constants.TRADINGPAGE_CREATE_BUTTON_CLICK
    }
}
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class OHLCTooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const { displayValuesFor } = this.props;
		const {
			xDisplayFormat,
			accessor,
			volumeFormat,
			ohlcFormat,
			percentFormat,
			displayTexts
		} = this.props;

		const { chartConfig: { width, height } } = moreProps;
		const { displayXAccessor } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);

		let displayDate, open, high, low, close, volume, percent;
		displayDate = open = high = low = close = volume = percent = displayTexts.na;

		if (isDefined(currentItem) && isDefined(accessor(currentItem))) {
			const item = accessor(currentItem);
			volume = isDefined(item.volume) ? volumeFormat(item.volume) : displayTexts.na;

			displayDate = xDisplayFormat(displayXAccessor(item));
			open = ohlcFormat(item.open);
			high = ohlcFormat(item.high);
			low = ohlcFormat(item.low);
			close = ohlcFormat(item.close);
			percent = percentFormat((item.close - item.open) / item.open);
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const itemsToDisplay = {
			displayDate,
			open,
			high,
			low,
			close,
			percent,
			volume,
			x,
			y
		};
		return this.props.children(this.props, moreProps, itemsToDisplay);
	}
	render() {
		return (
			<GenericChartComponent
				clip={false}
				svgDraw={this.renderSVG}
				drawOn={["mousemove"]}
			/>
		);
	}
}

OHLCTooltip.propTypes = {
	className: PropTypes.string,
	accessor: PropTypes.func,
	xDisplayFormat: PropTypes.func,
	children: PropTypes.func,
	volumeFormat: PropTypes.func,
	percentFormat: PropTypes.func,
	ohlcFormat: PropTypes.func,
	origin: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	onClick: PropTypes.func,
	displayValuesFor: PropTypes.func,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	displayTexts: PropTypes.object,
};

const displayTextsDefault = {
	d: "Date: ",
	o: " O: ",
	h: " H: ",
	l: " L: ",
	c: " C: ",
	v: " Vol: ",
	na: "n/a"
};

OHLCTooltip.defaultProps = {
	accessor: d => {
		return {
			date: d.date,
			open: d.open,
			high: d.high,
			low: d.low,
			close: d.close,
			volume: d.volume
		};
	},
	xDisplayFormat: timeFormat("%Y-%m-%d"),
	volumeFormat: format(".4s"),
	percentFormat: format(".2%"),
	ohlcFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 0],
	children: defaultDisplay,
	displayTexts: displayTextsDefault,
};

function defaultDisplay(props, moreProps, itemsToDisplay) {

	/* eslint-disable */
	const {
		className,
		textFill,
		labelFill,
		onClick,
		fontFamily,
		fontSize,
		displayTexts
	} = props;
	/* eslint-enable */

	const {
		open,
		high,
		low,
		close,
		volume,
		x,
		y
	} = itemsToDisplay;

	const textProps = (y) => ({
		x: 0,
		y,
		fontFamily,
		fontSize,
	});

	const tooltipText = (key, label, value, y) => {
		return (
			<ToolTipText {...textProps(y)}>
				<ToolTipTSpanLabel fill={labelFill} key={`label_${key}`}>{label}</ToolTipTSpanLabel>
				<tspan key={`value_${key}`} fill={textFill}>{value}</tspan>
			</ToolTipText>
		);
	};

	return (
		<g
			className={`react-stockcharts-tooltip-hover ${className}`}
			transform={`translate(${x}, ${y})`}
			onClick={onClick}
		>
			{tooltipText("O", displayTexts.o, open, 0)}
			{tooltipText("H", displayTexts.h, high, 15)}
			{tooltipText("L", displayTexts.l, low, 30)}
			{tooltipText("C", displayTexts.c, close, 45)}
			{tooltipText("Vol", displayTexts.v, volume, 60)}
		</g>
	);
}

export default OHLCTooltip;

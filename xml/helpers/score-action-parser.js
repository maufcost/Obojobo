let parseScoreActions = el => {
	return el.elements.map(child => {
		return child.value
	})
}

let parseScoreAction = el => {
	return {
		from: el.attributes.from,
		to: el.attributes.to,
		page: el.elements[0]
	}
}

module.exports = {
	parseScoreActions: parseScoreActions,
	parseScoreAction: parseScoreAction
}

import { findCueType } from './graphics.js'

export function getVariables(cues, dynamicText) {
	const variables = []
	const variableValues = {}

	cues.forEach((cue) => {
		const { variables: graphicVariables, variableValues: graphicVariableValues } = getVariablesForCue(cue, dynamicText)
		console.log('graphicVariables', graphicVariables)
		variables.push(...graphicVariables)
		Object.assign(variableValues, graphicVariableValues)
	})
	Object.entries(dynamicText).forEach(([id, val]) => {
		variables.push({
			variableId: id,
			name: id,
		})
		variableValues[id] = val
	})

	return { variables, variableValues }
}

export function replaceWithDataSource(text, dynamicText, keepBrackets = false) {
	const array = text.split(/\[(.*?)\]/g)
	let array2
	const regEx = /\[(.*?)\]/g
	const match = text.match(regEx)

	if (!match) return text

	array2 = [...array]

	match.forEach((m) => {
		let m2 = m.replace('[', '')
		let m3 = m2.replace(']', '')

		const index = array.indexOf(m3)

		let returnString = dynamicText?.[m3]

		array2.splice(index, 1)
		array2.splice(index, 0, !keepBrackets ? returnString : `[${returnString || 'Not set'}]`)
	})

	return array2.join('')
}

export function getTimerVariables(cue, time) {
	const { full, hh, mm, ss } = toTimeString(time)

	return [
		{
			variableId: `graphic_${cue.id}_hh`,
			name: `Hours (${cue.id})`,
			value: hh,
		},
		{
			variableId: `graphic_${cue.id}_mm`,
			name: `Minutes (${cue.id})`,
			value: mm,
		},
		{
			variableId: `graphic_${cue.id}_ss`,
			name: `Seconds (${cue.id})`,
			value: ss,
		},
		{
			variableId: `graphic_${cue.id}_hhmmss`,
			name: `Time (${cue.id})`,
			value: full,
		},
		{
			variableId: `graphic_${cue.id}_hhmm`,
			name: `Time (${cue.id})`,
			value: `${hh}:${mm}`,
		},
	]
}

export function getVariablesForCue(cue, dynamicText) {
	console.log('cue', cue)
	const variableValues = {}
	const variables = []

	const graphicType = findCueType(cue.type)

	variables.push({
		variableId: `graphic_${cue.id}_contents`,
		name: graphicType.label(cue),
	})

	variableValues[`graphic_${cue.id}_contents`] = replaceWithDataSource(graphicType.contents(cue), dynamicText)

	variables.push({
		variableId: `graphic_${cue.id}_label`,
		name: graphicType.label(cue),
	})
	variableValues[`graphic_${cue.id}_label`] = cue.label || cue.id

	const extraVariables = graphicType.extraVariables ? graphicType.extraVariables(cue) : []
	extraVariables.forEach((extraVariable) => {
		variables.push({ variableId: extraVariable.variableId, name: extraVariable.name })
		variableValues[extraVariable.variableId] = extraVariable.value
	})

	console.log('variables', variables)
	console.log('variableValues', variableValues)
	return { variables, variableValues }
}

export const toTimeString = (timeLeft) => {
	const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24) || 0
	const minutes = Math.floor((timeLeft / (1000 * 60)) % 60) || 0
	const seconds = Math.floor((timeLeft / 1000) % 60) || 0

	const hoursString = `${hours < 0 ? '-' : ''}${Math.abs(hours).toString().padStart(2, '0')}`
	const minutesString = `${Math.abs(minutes).toString().padStart(2, '0')}`
	const secondsString = `${Math.abs(seconds).toString().padStart(2, '0')}`

	return {
		full: `${hoursString}:${minutesString}:${secondsString}`,
		hh: hoursString,
		mm: minutesString,
		ss: secondsString,
	}
}

import { findCueType } from './graphics.js'
import { DateTime, Duration } from 'luxon'

/**
 * @typedef {import('./types.js').Cue} Cue
 * @typedef {import('./types.js').CueVariable} CueVariable
 */

/**
 *
 * @param {Cue[]} cues - the collection of cues
 * @param {object} dynamicText - the dynamic text object
 * @returns {object} - the variables and their values
 */
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

/**
 * @param {string} text - the source text
 * @param {object} dynamicText - the dynamic text object
 * @param {boolean} keepBrackets - whether to keep the brackets
 * @returns {string} - the source text with the dynamic text replaced
 */
export function replaceWithDataSource(text, dynamicText, keepBrackets = false) {
	const array = text.split(/\[(.*?)\]/g)
	let array2
	const regEx = /\[(.*?)\]/g
	const match = text.match(regEx)

	if (!match) return text

	array2 = [...array]

	match.forEach((m) => {
		const m2 = m.replace('[', '')
		const m3 = m2.replace(']', '')

		const index = array.indexOf(m3)

		const returnString = dynamicText?.[m3]

		array2.splice(index, 1)
		array2.splice(index, 0, keepBrackets ? `[${returnString || 'Not set'}]` : returnString)
	})

	return array2.join('')
}

/**
 *
 * @param {Cue} cue - the cue
 * @param {number|DateTime|Duration} time - the time
 * @returns {CueVariable[]} - the variables needed
 */
export function getTimerVariables(cue, time) {
	const { full, hh, mm, ss } = getTimeComponents(time, cue.format)

	return [
		{
			variableId: `graphic_${cue.id}_contents`,
			name: `Time (${cue.id})`,
			value: full,
		},
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
	]
}

/**
 *
 * @param {number|DateTime|Duration} time - the time
 * @param {string} momentFormat - the format to use (as per moment.js)
 * @returns {object} - the time components
 */
function getTimeComponents(time, momentFormat = 'HH:mm:ss') {
	let hh, mm, ss, full

	console.log('time', time)

	if (time instanceof Duration) {
		console.log('got a Duration')
		const result = time.shiftToAll()
		hh = result.hours.toString().padStart(2, '0')
		mm = result.minutes.toString().padStart(2, '0')
		ss = result.seconds.toString().padStart(2, '0')
		full = time.toFormat(convertMomentToLuxonFormat(momentFormat))
		return { hh, mm, ss, full }
	}

	if (!(time instanceof DateTime)) {
		console.log('got a number')
		time = DateTime.fromMillis(time)
	} else {
		console.log('got a DateTime')
	}

	hh = time.toFormat('H')
	mm = time.toFormat('m')
	ss = time.toFormat('s')
	full = time.toFormat(convertMomentToLuxonFormat(momentFormat))
	return { hh, mm, ss, full }

	// const { full, hh, mm, ss } = toTimeString(time)
}

/**
 * @param {Cue} cue - the cue
 * @param {object} dynamicText - the dynamic text
 * @returns {object} - the variables and their values
 */
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

/**
 *
 * @param {number} timeLeft - the time in milliseconds
 * @returns {object} - the time components
 */
export const toTimeString = (timeLeft) => {
	let hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24) || 0
	let minutes = Math.floor((timeLeft / (1000 * 60)) % 60) || 0
	const seconds = Math.floor((timeLeft / 1000) % 60) || 0

	if (timeLeft <= 0) {
		hours++
		minutes++
	}

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

/**
 *
 * @param {string} momentFormat - the format string in Moment format
 * @returns {string} - the format string in Luxon format
 */
function convertMomentToLuxonFormat(momentFormat) {
	const formatMapping = {
		YYYY: 'yyyy',
		YY: 'yy',
		MM: 'MM',
		DD: 'dd',
		HH: 'HH',
		mm: 'mm',
		ss: 'ss',
		ddd: 'EEE',
		dddd: 'EEEE',
	}

	let luxonFormat = momentFormat
	Object.keys(formatMapping).forEach((key) => {
		luxonFormat = luxonFormat.replace(new RegExp(key, 'g'), formatMapping[key])
	})

	return luxonFormat
}

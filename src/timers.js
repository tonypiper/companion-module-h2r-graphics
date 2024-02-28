import { isPausedOrReset, findCueType } from './graphics.js'
import { TimerCueTypeIds } from './constants.js'

/**
 * @typedef {import('./types.js').Cue} Cue
 * @typedef {import('./types.js').H2RGraphicsInstance} H2RGraphicsInstance
 */

const intervalIdObj = {}

/**
 *
 * @param {H2RGraphicsInstance} instance - the companion instance
 * @param {Cue[]} cues - the collection of cues
 */
export function startStopTimers(instance, cues) {
	cues.forEach((cue) => {
		if (TimerCueTypeIds.includes(cue.type)) {
			startStopTimer(instance, cue)
		}
	})

	Object.keys(intervalIdObj).forEach((intervalId) => {
		// Clear any timers that are no longer in the cues list
		if (!cues.find((cue) => cue.id === intervalId)) {
			clearInterval(intervalId)
			delete intervalIdObj[intervalId]
		}
	})
}

/**
 * @param {H2RGraphicsInstance} instance - the companion instance
 * @param {Cue} cue - the cue to start or stop
 * @returns {any} - from updateTimerDisplay
 */
function startStopTimer(instance, cue) {
	instance.log('debug', `ATTEMPTING ${cue.id} ${JSON.stringify(cue)}`)

	if (!isPausedOrReset(cue)) {
		clearInterval(intervalIdObj[cue.id])
		intervalIdObj[cue.id] = setInterval(() => {
			return updateTimerDisplay(instance, cue)
		}, 1000)
	}

	return updateTimerDisplay(instance, cue)
}

/**
 *
 * @param {H2RGraphicsInstance} instance - the companion instance
 * @param {Cue} cue - the cue to update
 * @returns {any} - from setVariableValues
 */
function updateTimerDisplay(instance, cue) {
	const variableValues = {}
	const cueType = findCueType(cue.type)
	const extraVariables = cueType.extraVariables ? cueType.extraVariables(cue) : [{}]
	extraVariables.forEach((extraVariable) => {
		variableValues[extraVariable.variableId] = extraVariable.value
	})

	if (isPausedOrReset(cue)) {
		clearInterval(intervalIdObj[cue.id])
		delete intervalIdObj[cue.id]
	}

	instance.log('debug', `INTERVAL ${cue.id} ${JSON.stringify(cue)}`)
	return instance.setVariableValues(variableValues)
}

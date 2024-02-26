import { TimerCueTypeIds, isPausedOrReset, findCueType } from './graphics.js'

const intervalIdObj = {}

export function startStopTimers(instance, cues) {
	cues.forEach((cue) => {
		if (TimerCueTypeIds.includes(cue.type)) {
			startStopTimer(instance, cue)
		}
	})
}

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

import io from 'socket.io-client'

import { getVariables } from './variables.js'

let socket = null

const intervalIdObj = {}

const toTimeString = (timeLeft, amount = 'full') => {
	const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24) || 0
	const minutes = Math.floor((timeLeft / (1000 * 60)) % 60) || 0
	const seconds = Math.floor((timeLeft / 1000) % 60) || 0

	if (amount == 'hh') return hours.toString().padStart(2, '0')
	if (amount == 'mm') return minutes.toString().padStart(2, '0')
	if (amount == 'ss') return seconds.toString().padStart(2, '0')

	const hoursString = `${hours < 0 ? '-' : ''}${Math.abs(hours).toString().padStart(2, '0')}`
	const minutesString = `${Math.abs(minutes).toString().padStart(2, '0')}`
	const secondsString = `${Math.abs(seconds).toString().padStart(2, '0')}`

	return `${hoursString}:${minutesString}:${secondsString}`
}

function startStopTimer(self, timerObj) {
	self.log('debug', `ATTEMPTING ${timerObj.id} ${JSON.stringify(timerObj)}`)

	function updateTimerDisplay(timeCue, timerKey) {
		const currentTime = new Date().getTime()
		let timeLeft

		if (timeCue.type === 'time_countup' || timeCue.type === 'big_time_countup') {
			timeLeft = currentTime - timeCue.startedAt
		} else if (
			timeCue.type === 'time_countdown' ||
			timeCue.type === 'big_time_countdown' ||
			timeCue.type === 'utility_speaker_timer'
		) {
			if (timeCue.state === 'reset') {
				timeLeft = Number.parseInt(timeCue.duration, 10)
			} else {
				timeLeft = timeCue.endAt - currentTime
			}
		} else if (timeCue.type === 'time_to_tod' || timeCue.type === 'big_time_to_tod') {
			let t = new Date(timeCue?.endTime)?.getTime() || 0
			timeLeft = t - currentTime
		}

		if (['paused', 'reset'].includes(timeCue.state)) {
			clearInterval(intervalIdObj[timerKey])
			delete intervalIdObj[timerKey]
			return self.setVariableValues({
				[`graphic_${timerKey}_contents`]: `⏸ ${toTimeString(timeLeft)}`,
				[`graphic_${timerKey}_hh`]: `${toTimeString(timeLeft, 'hh')}`,
				[`graphic_${timerKey}_mm`]: `${toTimeString(timeLeft, 'mm')}`,
				[`graphic_${timerKey}_ss`]: `${toTimeString(timeLeft, 'ss')}`,
			})
		}

		self.log('debug', `INTERVAL ${timeCue.id} ${JSON.stringify(timeCue)}`)
		return self.setVariableValues({
			[`graphic_${timerKey}_contents`]: `${toTimeString(timeLeft)}`,
			[`graphic_${timerKey}_hh`]: `${toTimeString(timeLeft, 'hh')}`,
			[`graphic_${timerKey}_mm`]: `${toTimeString(timeLeft, 'mm')}`,
			[`graphic_${timerKey}_ss`]: `${toTimeString(timeLeft, 'ss')}`,
		})
	}

	const timerKey = timerObj.id

	if (['paused', 'reset'].includes(timerObj.state)) return updateTimerDisplay(timerObj, timerKey)

	clearInterval(intervalIdObj[timerKey])
	intervalIdObj[timerKey] = setInterval(() => {
		return updateTimerDisplay(timerObj, timerKey)
	}, 1000)

	return updateTimerDisplay(timerObj, timerKey)
}

export const init_http = (instance) => {
	if (instance.config.host) {
		let uri = `http://${instance.config.host}:${instance.config.portV2}`
		socket = io.connect(uri, {
			transports: ['websocket'],
			forceNew: true,
		})

		socket.on('connect', () => {
			instance.updateStatus('ok')
		})

		socket.on('error', function (err) {
			instance.updateStatus('Error')

			console.log('error', err)
		})

		socket.on('disconnect', function () {
			instance.updateStatus('Disconnected')
		})

		socket.on('connected', function () {
			instance.updateStatus('ok')
		})

		socket.on('updateFrontend', function (data) {
			if (data.projects[instance.config.projectId] === undefined) {
				instance.updateStatus(`Project "${instance.config.projectId}" not found.`)
				return instance.log('info', `H2R Graphics project (${instance.config.projectId}) not found!`)
			}

			if (data.projects) {
				instance.updateStatus(`ok`)
				instance.PROJECTS = data.projects
				instance.SELECTED_PROJECT_GRAPHICS = data.projects[instance.config.projectId].cues || []
				instance.SELECTED_PROJECT_MEDIA = data.projects[instance.config.projectId].media || []
				instance.SELECTED_PROJECT_THEMES = data.projects[instance.config.projectId].themes || {}
				instance.SELECTED_PROJECT_VARIABLES = data.projects[instance.config.projectId].dynamicText || {}

				const { variables, variableValues } = getVariables(
					instance.SELECTED_PROJECT_GRAPHICS,
					instance.SELECTED_PROJECT_VARIABLES
				)

				instance.setVariableDefinitions(variables)
				instance.setVariableValues(variableValues)
			}

			instance.updateActions()
			instance.updatePresets()
			instance.updateFeedbacks()
			instance.checkFeedbacks('graphic_status')
		})
	}
}

import io from 'socket.io-client'

import { getVariables } from './variables.js'
import { startStopTimers } from './timers.js'

let socket = null

export const init_http = (instance) => {
	if (!instance.config.host || !instance.config.portV2) {
		return
	}
	const uri = `http://${instance.config.host}:${instance.config.portV2}`
	socket = io.connect(uri, {
		transports: ['websocket'],
		forceNew: true,
	})

	socket.on('connect', () => {
		instance.updateStatus('ok')
	})

	socket.on('error', (err) => {
		instance.updateStatus('Error')

		instance.log('error', err)
	})

	socket.on('disconnect', () => {
		instance.updateStatus('Disconnected')
	})

	socket.on('connected', () => {
		instance.updateStatus('ok')
	})

	socket.on('updateFrontend', (data) => {
		const project = data.projects[instance.config.projectId]
		if (data.projects === undefined || project === undefined) {
			instance.updateStatus(`Project "${instance.config.projectId}" not found.`)
			return instance.log('info', `H2R Graphics project (${instance.config.projectId}) not found!`)
		}

		instance.updateStatus(`ok`)
		instance.projects = data.projects
		instance.project = project

		const { variables, variableValues } = getVariables(instance.project.cues, instance.project.dynamicText)

		instance.setVariableDefinitions(variables)
		instance.setVariableValues(variableValues)
		startStopTimers(instance, instance.project.cues)

		instance.updateActions()
		instance.updatePresets()
		instance.updateFeedbacks()
		instance.checkFeedbacks('graphic_status')
	})
}

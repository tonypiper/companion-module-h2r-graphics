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

	socket.on('disconnect', function () {
		instance.updateStatus('Disconnected')
	})

	socket.on('connected', function () {
		instance.updateStatus('ok')
	})

	socket.on('updateFrontend', function (data) {
		const project = data.projects[instance.config.projectId]
		if (data.projects === undefined || project === undefined) {
			instance.updateStatus(`Project "${instance.config.projectId}" not found.`)
			return instance.log('info', `H2R Graphics project (${instance.config.projectId}) not found!`)
		}

		instance.updateStatus(`ok`)
		instance.PROJECTS = data.projects
		instance.SELECTED_PROJECT_GRAPHICS = project.cues || []
		instance.SELECTED_PROJECT_MEDIA = project.media || []
		instance.SELECTED_PROJECT_THEMES = project.themes || {}
		instance.SELECTED_PROJECT_VARIABLES = project.dynamicText || {}

		const { variables, variableValues } = getVariables(
			instance.SELECTED_PROJECT_GRAPHICS,
			instance.SELECTED_PROJECT_VARIABLES
		)

		instance.setVariableDefinitions(variables)
		instance.setVariableValues(variableValues)
		startStopTimers(instance, instance.SELECTED_PROJECT_GRAPHICS)

		instance.updateActions()
		instance.updatePresets()
		instance.updateFeedbacks()
		instance.checkFeedbacks('graphic_status')
	})
}

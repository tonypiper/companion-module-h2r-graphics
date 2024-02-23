import { combineRgb } from '@companion-module/base'
import { graphicToReadableLabel } from './utils.js'

const GRAPHIC_STATUS_OPTIONS = [
	{ id: 'ready', label: 'Ready' },
	{ id: 'cued', label: 'Cue on' },
	{ id: 'coming', label: 'Coming on air' },
	{ id: 'onair', label: 'On air' },
	{ id: 'going', label: 'Going off air' },
	{ id: 'cuedoff', label: 'Cue off' },
	{ id: 'offair', label: 'Off air' },
]

export const initFeedbacks = (self) => {
	const SELECTED_PROJECT_GRAPHICS = self.SELECTED_PROJECT_GRAPHICS || []
	const feedbacks = {}

	feedbacks.graphic_status = {
		type: 'boolean', // Feedbacks can either a simple boolean, or can be an 'advanced' style change (until recently, all feedbacks were 'advanced')
		name: 'Graphic status',
		defaultStyle: {
			bgcolor: combineRgb(255, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		// options is how the user can choose the condition the feedback activates for
		options: [
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: 'onair',
				choices: GRAPHIC_STATUS_OPTIONS,
			},
			{
				type: 'dropdown',
				label: 'Graphic',
				id: 'graphicId',
				default: SELECTED_PROJECT_GRAPHICS.length > 0 ? SELECTED_PROJECT_GRAPHICS[0].id : '',
				choices: [
					...SELECTED_PROJECT_GRAPHICS.map((c) => {
						const { id, label } = graphicToReadableLabel(c)
						return {
							id,
							label,
						}
					}),
				],
			},
		],
		callback(feedback) {
			const status = self.SELECTED_PROJECT_GRAPHICS.find((g) => g.id === feedback?.options?.graphicId)?.status
			// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
			return status === feedback.options.status
		},
	}
	return feedbacks
}

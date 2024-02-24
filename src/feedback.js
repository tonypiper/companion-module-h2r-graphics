import { combineRgb } from '@companion-module/base'
import { graphicToReadableLabel } from './variables.js'

const GRAPHIC_STATUS_OPTIONS = [
	{ id: 'ready', label: 'Ready' },
	{ id: 'cued', label: 'Cue on' },
	{ id: 'coming', label: 'Coming on air' },
	{ id: 'onair', label: 'On air' },
	{ id: 'going', label: 'Going off air' },
	{ id: 'cuedoff', label: 'Cue off' },
	{ id: 'offair', label: 'Off air' },
]

export const initFeedbacks = (graphics = []) => {
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
				default: graphics.length > 0 ? graphics[0].id : '',
				choices: choices(graphics),
			},
		],
		callback(feedback) {
			const status = graphics.find((graphic) => graphic.id === feedback?.options?.graphicId)?.status
			// This callback will be called whenever companion wants to check if this feedback is 'active' and should affect the button style
			return status === feedback.options.status;
		},
	}
	return feedbacks
}

function choices(graphics) {
	return [
		...graphics.map((graphic) => {
			const { id, label } = graphicToReadableLabel(graphic)
			return {
				id,
				label,
			}
		}),
	];
} 

import { combineRgb } from '@companion-module/base'
import { replaceWithDataSource } from './variables.js'
import { findCueType, cueToReadableLabel } from './graphics.js'

export const initPresets = (instance) => {
	const presets = {}
	const SELECTED_PROJECT_GRAPHICS = instance.SELECTED_PROJECT_GRAPHICS || []
	const SELECTED_PROJECT_VARIABLES = instance.SELECTED_PROJECT_VARIABLES || {}

	presets.Run = {
		type: 'button',
		category: 'Basic actions',
		name: 'Run',
		style: {
			text: 'Run',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'run',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets.Hide = {
		type: 'button',
		category: 'Basic actions',
		name: 'Hide all graphics',
		style: {
			text: 'Hide all',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'clear',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	const createPresetShowHide = (category, graphic) => {
		const graphicsType = findCueType(graphic.type)
		const labelSource = ['lower_third', 'lower_third_animated'].includes(graphic.type)
			? instance.config.lowerThirdPresetLabelSource || 'contents'
			: 'contents'

		return {
			category,
			type: 'button',
			name: replaceWithDataSource(cueToReadableLabel(graphic).label, SELECTED_PROJECT_VARIABLES),
			style: {
				text: `$(${instance.config.label}:graphic_${graphic.id}_${labelSource})`,
				png64: graphicsType.png,
				pngalignment: 'center:center',
				size: instance.config.presetButtonTextSize || '18',
				color: combineRgb(255, 255, 255),
				bgcolor: graphicsType.bgColor,
				latch: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'showHide',
							options: { graphicId: graphic.id, status: 'toggle' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: graphic.id,
						status: 'coming',
					},
					style: {
						bgcolor: combineRgb(132, 0, 0),
					},
				},
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: graphic.id,
						status: 'onair',
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
				},
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: graphic.id,
						status: 'going',
					},
					style: {
						bgcolor: combineRgb(132, 0, 0),
					},
				},
			],
		}
	}

	SELECTED_PROJECT_GRAPHICS.forEach((graphic) => {
		if (graphic.type === 'section') return null
		const preset = createPresetShowHide('Show/Hide', graphic)

		presets[graphic.id] = preset
	})

	return presets
}

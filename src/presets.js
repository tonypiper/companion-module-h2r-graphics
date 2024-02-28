import { replaceWithDataSource } from './variables.js'
import { findCueType, cueToReadableLabel } from './graphics.js'
import { Color, CueTypeIds } from './constants.js'

export const initPresets = (config, cues = [], variables = {}) => {
	const presets = {}

	presets.Run = {
		type: 'button',
		category: 'Basic actions',
		name: 'Run',
		style: {
			text: 'Run',
			size: '18',
			color: Color.White,
			bgcolor: Color.Black,
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
			color: Color.White,
			bgcolor: Color.Black,
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

	const createPresetShowHide = (category, cue) => {
		const graphicsType = findCueType(cue.type)
		const labelSource = [CueTypeIds.LowerThird, CueTypeIds.LowerThirdAnimated].includes(cue.type)
			? config.lowerThirdPresetLabelSource || 'contents'
			: 'contents'

		return {
			category,
			type: 'button',
			name: replaceWithDataSource(cueToReadableLabel(cue).label, variables),
			style: {
				text: `$(${config.label}:graphic_${cue.id}_${labelSource})`,
				png64: graphicsType.png,
				pngalignment: 'center:center',
				size: config.presetButtonTextSize || '18',
				color: Color.White,
				bgcolor: graphicsType.bgColor,
				latch: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'showHide',
							options: { graphicId: cue.id, status: 'toggle' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: cue.id,
						status: 'coming',
					},
					style: {
						bgcolor: Color.Red2,
					},
				},
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: cue.id,
						status: 'onair',
					},
					style: {
						bgcolor: Color.Red,
					},
				},
				{
					feedbackId: 'graphic_status',
					options: {
						graphicId: cue.id,
						status: 'going',
					},
					style: {
						bgcolor: Color.Red2,
					},
				},
			],
		}
	}

	cues.forEach((cue) => {
		if (cue.type === 'section') return null
		const preset = createPresetShowHide('Show/Hide', cue)

		presets[cue.id] = preset
	})

	return presets
}

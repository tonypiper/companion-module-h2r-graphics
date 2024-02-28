import got from 'got'

import { stringToMS } from './utils.js'
import { cueToReadableLabel } from './graphics.js'
import { CueTypeIds } from './constants.js'

const GRAPHIC_STATUS_TOGGLES = [
	{ id: 'coming', label: 'Show' },
	{ id: 'going', label: 'Hide' },
	{ id: 'toggle', label: 'Toggle' },
	{ id: 'cued', label: 'Cue on' },
	{ id: 'cuedoff', label: 'Cue off' },
]

const GRAPHIC_POSITION_OPTIONS = [
	{ id: 'tl', label: 'Top Left' },
	{ id: 'tc', label: 'Top Middle' },
	{ id: 'tr', label: 'Top Right' },
	{ id: 'ml', label: 'Middle Left' },
	{ id: 'mc', label: 'Middle' },
	{ id: 'mr', label: 'Middle Right' },
	{ id: 'bl', label: 'Bottom Left' },
	{ id: 'bc', label: 'Bottom Middle' },
	{ id: 'br', label: 'Bottom Right' },
]

const runResumeTypes = [
	CueTypeIds.UtilitySpeakerTimer,
	CueTypeIds.TimeCountdown,
	CueTypeIds.TimeCountup,
	CueTypeIds.BigTimeCountdown,
	CueTypeIds.BigTimeCountup,
]

export const actionsV2 = (instance, config, graphics = [], media = [], themes = {}) => {
	/**
	 *
	 * @param {string} cmd - the command will be appended to the baseUri
	 * @param {object} body - the object
	 */
	const sendHttpMessage = async (cmd = '', body = {}) => {
		const baseUri = `http://${config.host}:${config.portV2}/api/${config.projectId}`

		instance.log('debug', `ATTEMPTING ${baseUri}/${cmd}`)
		await got.post(`${baseUri}/${cmd}`, {
			json: {
				...body,
			},
		})
	}

	const getChoices = (type = []) => {
		const typeArray = Array.isArray(type) ? type : [type]

		const filterByType = typeArray.length > 0 ? (c) => typeArray.includes(c.type) : () => true

		return [
			...graphics.filter(filterByType).map((c) => {
				const { id, label } = cueToReadableLabel(c)

				return {
					id,
					label,
				}
			}),
		]
	}

	const getGraphicDropdown = (type = []) => {
		return {
			type: 'dropdown',
			label: 'Graphic',
			id: 'graphicId',
			default: graphics.length > 0 ? graphics[0].id : '',
			choices: getChoices(type),
		}
	}

	return {
		run: {
			name: 'Run',
			options: [],
			callback: async () => {
				await sendHttpMessage(`run`)
			},
		},
		clear: {
			name: 'Hide all',
			options: [],
			callback: async () => {
				await sendHttpMessage(`clear`)
			},
		},
		showHide: {
			name: 'Show/Hide graphic',
			options: [
				{
					type: 'dropdown',
					label: 'Show/Hide',
					id: 'status',
					default: 'coming',
					choices: GRAPHIC_STATUS_TOGGLES,
				},
				getGraphicDropdown(),
			],
			callback: async (action) => {
				await sendHttpMessage(`graphic/${action.options.graphicId}/update`, {
					status: action.options.status,
				})
			},
		},
		showHideGraphicWithVariable: {
			name: 'Show/Hide graphic (using Text or Variable)',
			options: [
				{
					type: 'dropdown',
					label: 'Show/Hide',
					id: 'status',
					default: 'coming',
					choices: GRAPHIC_STATUS_TOGGLES,
				},
				{
					type: 'textinput',
					label: 'Graphic',
					id: 'graphicId',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const graphicId = await instance.parseVariablesInString(action.options.graphicId || '')
				await sendHttpMessage(`graphic/${graphicId}/update`, {
					status: action.options.status,
				})
			},
		},
		updateContentLowerThird: {
			name: 'Update content - Lower third',
			options: [
				getGraphicDropdown(CueTypeIds.LowerThird),
				{
					type: 'textinput',
					label: 'Line one',
					id: 'line_one',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Line two',
					id: 'line_two',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const l1 = await instance.parseVariablesInString(action.options.line_one || '')
				const l2 = await instance.parseVariablesInString(action.options.line_two || '')
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					line_one: l1,
					line_two: l2,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateContentLowerThirdAnimated: {
			name: 'Update content - Lower Third Animated',
			options: [
				getGraphicDropdown(CueTypeIds.LowerThirdAnimated),
				{
					type: 'dropdown',
					label: 'Animation',
					id: 'animationName',
					default: 'reveal',
					choices: [
						{
							id: 'reveal',
							label: 'Reveal',
						},
						{
							id: 'unfold',
							label: 'Unfold',
						},
						{
							id: 'slide-out',
							label: 'Slide out',
						},
					],
				},
				{
					type: 'textinput',
					label: 'Line one',
					id: 'line_one',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Line two',
					id: 'line_two',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const l1 = await instance.parseVariablesInString(action.options.line_one || '')
				const l2 = await instance.parseVariablesInString(action.options.line_two || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					animationName: action.options.animationName,
					line_one: l1,
					line_two: l2,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateContentMessage: {
			name: 'Update content - Message',
			options: [
				getGraphicDropdown(CueTypeIds.Message),
				{
					type: 'textinput',
					label: 'Message body',
					id: 'body',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const b = await instance.parseVariablesInString(action.options.body || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					body: b,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateContentTime: {
			name: 'Update content - Time',
			options: [
				getGraphicDropdown(CueTypeIds.Time),
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'time_of_day',
					choices: [
						{
							id: 'time_of_day',
							label: 'Current time of day',
						},
						{
							id: 'to_time_of_day',
							label: 'To time of day',
						},
						{
							id: 'countdown',
							label: 'Count down',
						},
						{
							id: 'countup',
							label: 'Count up',
						},
					],
				},
				{
					type: 'textinput',
					label: 'Time (HH:MM:SS)',
					id: 'time',
					default: '00:01:00',
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				let body = {}
				const d = new Date()
				if (action.options.type === 'time_of_day') {
					body = {
						timerType: action.options.type,
					}
				} else if (action.options.type === 'to_time_of_day') {
					body = {
						timerType: action.options.type,
						endTime: action.options.time,
						timeLeft: stringToMS(action.options.time) - d.getMilliseconds(),
					}
				} else if (action.options.type === 'countdown') {
					body = {
						timerType: action.options.type,
						duration: action.options.time,
						durationMS: stringToMS(action.options.time),
						timeLeft: stringToMS(action.options.time),
					}
				} else if (action.options.type === 'countup') {
					body = {
						timerType: action.options.type,
						duration: action.options.time,
						durationMS: stringToMS(action.options.time),
						timeLeft: 0,
					}
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateContentBigTimer: {
			name: 'Update content - Big Timer',
			options: [
				getGraphicDropdown(CueTypeIds.BigTime),
				{
					type: 'dropdown',
					label: 'Shape',
					id: 'shape',
					default: 'circle',
					choices: [
						{
							id: 'circle',
							label: 'Circle',
						},
						{
							id: 'line',
							label: 'Line',
						},
						{
							id: 'mask',
							label: 'Mask',
						},
					],
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'countdown',
					choices: [
						{
							id: 'countdown',
							label: 'Count down',
						},
						{
							id: 'countup',
							label: 'Count up',
						},
					],
				},
				{
					type: 'textinput',
					label: 'Time (HH:MM:SS)',
					id: 'time',
					default: '00:01:00',
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				let body = {}
				if (action.options.type === 'countdown') {
					body = {
						shape: action.options.shape,
						timerType: action.options.type,
						duration: action.options.time,
						durationMS: stringToMS(action.options.time),
						timeLeft: stringToMS(action.options.time),
					}
				} else if (action.options.type === 'countup') {
					body = {
						shape: action.options.shape,
						timerType: action.options.type,
						duration: action.options.time,
						durationMS: stringToMS(action.options.time),
						timeLeft: 0,
					}
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateContentImage: {
			name: 'Update content - Image',
			options: [
				getGraphicDropdown(CueTypeIds.Image),
				{
					type: 'textinput',
					label: 'Name',
					id: 'imageName',
				},
				{
					type: 'dropdown',
					label: 'Image',
					id: 'imageFilename',
					choices: [
						...media.map((img) => {
							return {
								id: img.filename,
								label: img.originalname,
							}
						}),
					],
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					name: action.options.image_name,
					filename: `${action.options.imageFilename}`,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateContentTicker: {
			name: 'Update content - Ticker',
			options: [
				getGraphicDropdown(CueTypeIds.Ticker),
				{
					type: 'textinput',
					label: 'Title',
					id: 'title',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Items (Use | to split items)',
					id: 'items',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const t = await instance.parseVariablesInString(action.options.title || '')
				const items = await instance.parseVariablesInString(action.options.items || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					title: t,
					items: items.split('|').map((item, i) => {
						return {
							title: `Item ${i + 1}`,
							body: item,
						}
					}),
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateContentWebpage: {
			name: 'Update content - Webpage',
			options: [
				getGraphicDropdown(CueTypeIds.Webpage),
				{
					type: 'textinput',
					label: 'Name',
					id: 'name',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'URL',
					id: 'url',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const name = await instance.parseVariablesInString(action.options.name || '')
				const url = await instance.parseVariablesInString(action.options.url || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					name,
					url,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateContentUtilityLargeText: {
			name: 'Update content - Large Text (Utility)',
			options: [
				getGraphicDropdown(CueTypeIds.UtilityLargeText),
				{
					type: 'textinput',
					label: 'Text',
					id: 'text',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const t = await instance.parseVariablesInString(action.options.text || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					text: t,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		speakerTimerRun: {
			name: 'Run/Resume - Timer',
			options: [getGraphicDropdown(runResumeTypes)],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/timer/run`
				await sendHttpMessage(cmd)
			},
		},
		speakerTimerReset: {
			name: 'Reset - Timer',
			options: [getGraphicDropdown(runResumeTypes)],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/timer/reset`
				await sendHttpMessage(cmd)
			},
		},
		speakerTimerPause: {
			name: 'Pause - Timer',
			options: [getGraphicDropdown(runResumeTypes)],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/timer/pause`
				await sendHttpMessage(cmd)
			},
		},
		speakerTimerJump: {
			name: 'Add/Remove time - Timer',
			options: [
				getGraphicDropdown(runResumeTypes),
				{
					type: 'number',
					label: 'Amount in seconds (+/-)',
					id: 'amount',
					default: 10,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const t = await instance.parseVariablesInString(action.options.amount || 0)

				const cmd = `graphic/${action.options.graphicId}/timer/jump/${t}`

				await sendHttpMessage(cmd)
			},
		},
		speakerTimerDuration: {
			name: 'Set duration - Timer',
			options: [
				getGraphicDropdown([CueTypeIds.UtilitySpeakerTimer, CueTypeIds.TimeCountdown, CueTypeIds.TimeCountup]),
				{
					type: 'textinput',
					label: 'Time (HH:MM:SS)',
					id: 'time',
					default: '00:01:00',
				},
			],
			callback: async (action) => {
				const t = await instance.parseVariablesInString(action.options.time || 0)

				const cmd = `graphic/${action.options.graphicId}/timer/duration/${stringToMS(t) / 1000}`

				await sendHttpMessage(cmd)
			},
		},
		speakerTimerSetMessage: {
			name: 'Speaker Timer - Set Message to speaker',
			options: [
				getGraphicDropdown(CueTypeIds.UtilitySpeakerTimer),
				{
					type: 'textinput',
					label: 'Message',
					id: 'body',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const b = await instance.parseVariablesInString(action.options.body || '')

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					speakerMessage: b,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		speakerTimerToggleMessage: {
			name: 'Speaker Timer - Show/Hide message to speaker',
			options: [
				getGraphicDropdown(CueTypeIds.UtilitySpeakerTimer),
				{
					type: 'dropdown',
					label: 'Show/Hide',
					id: 'status',
					default: 'true',
					choices: [
						{ id: true, label: 'Show' },
						{ id: false, label: 'Hide' },
					],
				},
			],
			callback: async (action) => {
				const choice = action.options.status

				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					showSpeakerMessage: String(choice) === 'true',
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateContentScoreTotal: {
			name: 'Update content - Score - Total',
			options: [
				getGraphicDropdown(CueTypeIds.Score),
				{
					type: 'dropdown',
					label: 'Team number',
					id: 'team',
					default: '1',
					choices: [
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
					],
				},
				{
					type: 'dropdown',
					label: 'Level number',
					id: 'level',
					default: '1',
					choices: [
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
						{ id: '5', label: '5' },
						{ id: '6', label: '6' },
					],
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'set',
					choices: [
						{ id: 'set', label: 'Set score' },
						{ id: 'up', label: 'Increment up' },
						{ id: 'down', label: 'Decrement down' },
					],
				},
				{
					type: 'number',
					label: 'Amount',
					id: 'amount',
					min: -1000,
					max: 1000,
					default: 1,
					step: 1,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/updateScore/${action.options.team}/${action.options.level}/${action.options.type}/${action.options.amount}`

				await sendHttpMessage(cmd)
			},
		},
		updateGraphicPosition: {
			name: 'Update graphic position',
			options: [
				getGraphicDropdown(),
				{
					type: 'dropdown',
					label: 'Position',
					id: 'position',
					default: 'mc',
					choices: [...GRAPHIC_POSITION_OPTIONS],
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					position: action.options.position,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateGraphicX: {
			name: 'Update graphic offset X',
			options: [
				getGraphicDropdown(),
				{
					type: 'number',
					label: 'X (-100 to 100)',
					id: 'x',
					min: -100,
					max: 100,
					default: 0,
					step: 0.5,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					offsetX: action.options.x,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateGraphicY: {
			name: 'Update graphic offset Y',
			options: [
				getGraphicDropdown(),
				{
					type: 'number',
					label: 'Y (-100 to 100)',
					id: 'y',
					min: -100,
					max: 100,
					default: 0,
					step: 0.5,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					offsetY: action.options.y,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		updateGraphicXY: {
			name: 'Update graphic offset X & Y',
			options: [
				getGraphicDropdown(),
				{
					type: 'number',
					label: 'X (-100 to 100)',
					id: 'x',
					min: -100,
					max: 100,
					default: 0,
					step: 0.5,
					required: true,
					range: false,
				},
				{
					type: 'number',
					label: 'Y (-100 to 100)',
					id: 'y',
					min: -100,
					max: 100,
					default: 0,
					step: 0.5,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					offsetX: action.options.x,
					offsetY: action.options.y,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateGraphicScale: {
			name: 'Update graphic scale',
			options: [
				getGraphicDropdown(),
				{
					type: 'number',
					label: 'Scale (1 to 500)',
					id: 'scale',
					min: 1,
					max: 500,
					default: 100,
					step: 0.5,
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					scale: action.options.scale,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		updateGraphicTheme: {
			name: 'Update graphic theme',
			options: [
				getGraphicDropdown(),
				{
					type: 'dropdown',
					label: 'Theme',
					id: 'theme',
					choices: [
						...Object.entries(themes).map(([id, theme]) => {
							return {
								id,
								label: theme.name,
							}
						}),
					],
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					theme: action.options.theme,
				}
				await sendHttpMessage(cmd, body)
			},
		},
		setTextVariable: {
			name: 'Set text variable',
			options: [
				{
					type: 'dropdown',
					label: 'Text variable',
					id: 'variable',
					default: 'text.1',
					choices: [
						{
							id: 'text.1',
							label: '[text.1]',
						},
						{
							id: 'text.2',
							label: '[text.2]',
						},
						{
							id: 'text.3',
							label: '[text.3]',
						},
						{
							id: 'text.4',
							label: '[text.4]',
						},
						{
							id: 'text.5',
							label: '[text.5]',
						},
						{
							id: 'text.6',
							label: '[text.6]',
						},
					],
				},
				{
					type: 'textinput',
					label: 'Text',
					id: 'text',
				},
			],
			callback: async (action) => {
				const cmd = `updateVariableText/${action.options.variable}`
				const body = {
					text: action.options.text,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		addVariableListItem: {
			name: 'Variable List - Add item',
			options: [
				{
					type: 'number',
					label: 'List',
					id: 'listId',
					default: '1',
					min: 1,
					max: 100,
					step: 1,
				},
				{
					type: 'textinput',
					label: 'Column 1',
					id: 'colOne',
				},
				{
					type: 'textinput',
					label: 'Column 2',
					id: 'colTwo',
				},
				{
					type: 'textinput',
					label: 'Column 3',
					id: 'colThree',
				},
			],
			callback: async (action) => {
				const cmd = `updateVariableList/${action.options.listId}/addRow`
				const body = {
					row: [{ value: action.options.colOne }, { value: action.options.colTwo }, { value: action.options.colThree }],
				}

				await sendHttpMessage(cmd, body)
			},
		},
		addVariableSelectRow: {
			name: 'Variable List - Select row',
			options: [
				{
					type: 'number',
					label: 'List',
					id: 'listId',
					default: '1',
					min: 1,
					max: 100,
					step: 1,
				},
				{
					type: 'dropdown',
					label: 'Next/Previous/Number',
					id: 'nextPreviousNumber',
					default: 'next',
					choices: [
						{
							id: 'next',
							label: 'Next',
						},
						{
							id: 'previous',
							label: 'Previous',
						},
						{
							id: 'number',
							label: 'Number',
						},
					],
				},
				{
					type: 'number',
					label: 'Row number',
					id: 'number',
					min: 1,
					max: 1000,
					default: 1,
					step: 1,
					required: true,
					range: false,
					isVisible: (values) => values.nextPreviousNumber === 'number',
				},
			],
			callback: async (action) => {
				const cmd =
					action.options.nextPreviousNumber === 'next' || action.options.nextPreviousNumber === 'previous'
						? `updateVariableList/${action.options.listId}/selectRow/${action.options.nextPreviousNumber}`
						: `updateVariableList/${action.options.listId}/selectRow/${action.options.number}`

				await sendHttpMessage(cmd)
			},
		},
		setTransitionOverride: {
			name: 'Set Transition Override',
			options: [
				getGraphicDropdown(),
				{
					type: 'dropdown',
					label: 'Next/Previous/Number',
					id: 'override',
					default: 'use-theme',
					choices: [
						{
							label: 'Use theme transition (default)',
							id: 'use-theme',
						},
						{
							label: 'None',
							id: 'none',
						},
						{
							label: 'Fade',
							id: 'fade',
						},
						{
							label: 'Slide',
							id: 'slide',
						},
						{
							label: 'Slide & Fade',
							id: 'slide_fade',
						},
						{
							label: 'Scale',
							id: 'scale',
						},
						{
							label: 'Scale & Fade',
							id: 'scale_fade',
						},
						{
							label: 'Blur & Fade',
							id: 'blur_fade',
						},
					],
				},
			],
			callback: async (action) => {
				const cmd = `graphic/${action.options.graphicId}/update`
				const body = {
					transition: action.options.override,
				}

				await sendHttpMessage(cmd, body)
			},
		},
		sendCustonHTTP: {
			name: 'Send custom HTTP',
			options: [
				{
					type: 'textinput',
					label: 'URI',
					id: 'uri',
				},
			],
			callback: async (action) => {
				const cmd = `${action.options.uri}`
				await sendHttpMessage(cmd)
			},
		},
	}
}

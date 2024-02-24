import { findGraphic } from './graphics.js'
import { msToString } from './utils.js'

export function getVariables(graphics, dynamicText) {
	const variables = []
	const variableValues = {}

	graphics.map((graphic) => {
		const { id, label, contents } = graphicToReadableLabel(graphic)
		variables.push({
			variableId: `graphic_${id}_contents`,
			name: label,
		})
		variables.push({
			variableId: `graphic_${id}_label`,
			name: label,
		})
		variableValues[`graphic_${id}_label`] = graphic.label || id

		if (['lower_third', 'lower_third_animated'].includes(graphic.type)) {
			variables.push({
				variableId: `graphic_${id}_first_line`,
				name: label,
			})
			variableValues[`graphic_${id}_first_line`] = graphic.line_one
		}

		if (['social'].includes(graphic.type)) {
			variables.push({
				variableId: `graphic_${id}_author`,
				name: `Social - Author (${id})`,
			})
			variableValues[`graphic_${id}_author`] = graphic.chat.authorDetails.displayName

			variables.push({
				variableId: `graphic_${id}_author_profile_image_url`,
				name: `Social - Author Profile Image URL (${id})`,
			})
			variableValues[`graphic_${id}_author_profile_image_url`] = graphic.chat.authorDetails.profileImageUrl

			variables.push({
				variableId: `graphic_${id}_source`,
				name: `Social - Source (${id})`,
			})
			variableValues[`graphic_${id}_source`] = graphic.chat.source
		}

		if (
			[
				'time_countdown',
				'time_countup',
				'time_to_tod',
				'big_time_countdown',
				'big_time_countup',
				'big_time_to_tod',
				'utility_speaker_timer',
			].includes(graphic.type)
		) {
			variables.push(
				{
					variableId: `graphic_${id}_hh`,
					name: `Hours (${id})`,
				},
				{
					variableId: `graphic_${id}_mm`,
					name: `Minutes (${id})`,
				},
				{
					variableId: `graphic_${id}_ss`,
					name: `Seconds (${id})`,
				}
			)
			return startStopTimer(self, graphic)
		}
		variableValues[`graphic_${id}_contents`] = replaceWithDataSource(contents, dynamicText)
	})
	Object.entries(dynamicText).forEach(([id, val]) => {
		variables.push({
			variableId: id,
			name: id,
		})
		variableValues[id] = val
	})

	return { variables, variableValues }
}

export function replaceWithDataSource(text, dynamicText, keepBrackets = false) {
	const array = text.split(/\[(.*?)\]/g)
	let array2
	const regEx = /\[(.*?)\]/g
	const match = text.match(regEx)

	if (!match) return text

	array2 = [...array]

	match.forEach((m) => {
		let m2 = m.replace('[', '')
		let m3 = m2.replace(']', '')

		const index = array.indexOf(m3)

		let returnString = dynamicText?.[m3]

		array2.splice(index, 1)
		array2.splice(index, 0, !keepBrackets ? returnString : `[${returnString || 'Not set'}]`)
	})

	return array2.join('')
}

export function graphicToReadableLabel(graphic) {
	const id = graphic.id
	let label
	let contents

	const theGraphic = findGraphic(graphic.type)
	if (theGraphic) {
		return {
			id,
			label: theGraphic.label(graphic),
			contents: theGraphic.contents(graphic),
		}
	}

	if (graphic.type === 'lower_third') {
		label = `${graphic.line_one}, ${graphic.line_two} (Lower third - ${id})`
		contents = `${graphic.line_one}, ${graphic.line_two}`
	} else if (graphic.type === 'message') {
		label = `${graphic.body} (Message) - ${id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'time') {
		if (graphic.timerType === 'to_time_of_day') {
			label = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft * 1000)
					: graphic.endTime
			} (Time - ${id})`
			contents = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft * 1000)
					: graphic.endTime
			}`
		} else if (graphic.timerType === 'time_of_day') {
			label = `Current time of day (Time - ${id})`
			contents = `Current time of day`
		} else if (graphic.timerType === 'countdown' || graphic.timerType === 'countup') {
			label = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			} (Time - ${id})`
			contents = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			}`
		} else {
			label = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			} (Time - ${id})`
			contents = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			}`
		}
	} else if (graphic.type === 'image') {
		label = `${graphic.name} (Image - ${id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'image_with_message') {
		label = `${graphic.body} (Image with Mesage - ${id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'ticker') {
		label = `${graphic.title} (Ticker - ${id})`
		contents = `${graphic.title}`
	} else if (graphic.type === 'social') {
		label = `Social - ${id}`
		contents = `${graphic.chat.snippet.displayMessage}`
	} else if (graphic.type === 'webpage') {
		label = `${graphic.url} (Webpage - ${id})`
		contents = `${graphic.url}`
	} else if (graphic.type === 'score') {
		label = `Score - ${id}`
		contents = `Score`
	} else if (graphic.type === 'lower_third_animated') {
		label = `${graphic.line_one}, ${graphic.line_two} (LT Animated - ${id})`
		contents = `${graphic.line_one}, ${graphic.line_two}`
	} else if (graphic.type === 'big_time') {
		label = `${
			graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
				? msToString(graphic.timeLeft)
				: graphic.duration
		} (Big timer - ${id})`
		contents = `${
			graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
				? msToString(graphic.timeLeft)
				: graphic.duration
		}`
	} else if (graphic.type === 'icon_with_message') {
		label = `${graphic.body} (Message - ${id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'credits') {
		label = `${graphic.lead} (Credits - ${id})`
		contents = `${graphic.lead}`
	} else if (graphic.type === 'animated_background') {
		label = `${graphic.animationName} (Animated Background - ${id})`
		contents = `${graphic.animationName}`
	} else if (graphic.type === 'video') {
		label = `${graphic.name} (Video - ${id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'audio') {
		label = `${graphic.name} (Audio - ${id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'celebration') {
		label = `${graphic.celebrationType} (Celebration - ${id})`
		contents = `${graphic.celebrationType}`
	} else if (graphic.type === 'now_next_then') {
		label = `${graphic.items[0].sectionTitle} (Now next then - ${id})`
		contents = `${graphic.items[0].sectionTitle}`
	} else if (graphic.type === 'qr') {
		label = `${graphic.message} (QR code - ${id})`
		contents = `${graphic.message}`
	} else if (graphic.type === 'map') {
		label = `Map - ${id}`
		contents = `Map`
	} else if (graphic.type === 'checklist') {
		label = `${graphic.title} (Checklist - ${id})`
		contents = `${graphic.title}`
	} else if (graphic.type === 'utility_large_text') {
		label = `${graphic.text} (Large Text - ${id})`
		contents = `${graphic.text}`
	} else if (graphic.type === 'utility_time_of_day') {
		label = `Time of day (Time of Day - ${id})`
		contents = `Time of day`
	} else if (graphic.type === 'utility_pattern') {
		label = `Pattern - ${id}`
		contents = `Pattern`
	} else if (graphic.type === 'utility_speaker_timer') {
		label = `${msToString(graphic.duration)} (Speaker timer - ${id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else if (graphic.type === 'time_tod') {
		label = `Time of day (Time of Day - ${id})`
		contents = `Time of day`
	} else if (graphic.type === 'time_to_tod') {
		label = `To time of day (To time of Day - ${id})`
		contents = `To time of day`
	} else if (graphic.type === 'time_countdown' || graphic.type === 'big_time_countdown') {
		label = `${msToString(graphic.duration)} (Countdown timer - ${id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else if (graphic.type === 'time_countup' || graphic.type === 'big_time_countup') {
		label = `${msToString(graphic.duration)} (Count Up timer - ${id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else {
		label = `${graphic.type} (${id})`
		contents = `${graphic.type} (${id})`
	}

	return {
		id,
		label,
		contents,
	}
}

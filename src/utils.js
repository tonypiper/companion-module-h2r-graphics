import { findGraphic, graphics } from './graphics.js'

export const msToString = (ms = 0) => {
	let seconds = ms / 1000
	let hours = parseInt(seconds / 3600)
	seconds = seconds % 3600
	let minutes = parseInt(seconds / 60)
	seconds = Math.ceil(seconds % 60)
	return `${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`}:${
		seconds < 10 ? `0${seconds}` : `${seconds === 60 ? '00' : seconds}`
	}`
}

export const stringToMS = (string = '00:00:00') => {
	let [h, m, s = '00'] = string.split(':')

	return (parseInt(h) * 60 * 60 + parseInt(m) * 60 + parseInt(s)) * 1000
}

export const graphicToReadableLabel = (graphic) => {
	let id = graphic.id
	let label
	let contents

	if (graphic.type === 'lower_third') {
		label = `${graphic.line_one}, ${graphic.line_two} (Lower third - ${graphic.id})`
		contents = `${graphic.line_one}, ${graphic.line_two}`
	} else if (graphic.type === 'message') {
		label = `${graphic.body} (Message) - ${graphic.id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'time') {
		if (graphic.timerType === 'to_time_of_day') {
			label = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft * 1000)
					: graphic.endTime
			} (Time - ${graphic.id})`
			contents = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft * 1000)
					: graphic.endTime
			}`
		} else if (graphic.timerType === 'time_of_day') {
			label = `Current time of day (Time - ${graphic.id})`
			contents = `Current time of day`
		} else if (graphic.timerType === 'countdown' || graphic.timerType === 'countup') {
			label = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			} (Time - ${graphic.id})`
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
			} (Time - ${graphic.id})`
			contents = `${
				graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
					? msToString(graphic.timeLeft)
					: graphic.duration
			}`
		}
	} else if (graphic.type === 'image') {
		label = `${graphic.name} (Image - ${graphic.id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'image_with_message') {
		label = `${graphic.body} (Image with Mesage - ${graphic.id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'ticker') {
		label = `${graphic.title} (Ticker - ${graphic.id})`
		contents = `${graphic.title}`
	} else if (graphic.type === 'social') {
		label = `Social - ${graphic.id}`
		contents = `Social`
	} else if (graphic.type === 'webpage') {
		label = `${graphic.url} (Webpage - ${graphic.id})`
		contents = `${graphic.url}`
	} else if (graphic.type === 'score') {
		label = `Score - ${graphic.id}`
		contents = `Score`
	} else if (graphic.type === 'lower_third_animated') {
		label = `${graphic.line_one}, ${graphic.line_two} (LT Animated - ${graphic.id})`
		contents = `${graphic.line_one}, ${graphic.line_two}`
	} else if (graphic.type === 'big_time') {
		label = `${
			graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
				? msToString(graphic.timeLeft)
				: graphic.duration
		} (Big timer - ${graphic.id})`
		contents = `${
			graphic.status === 'onair' || graphic.status === 'coming' || graphic.status === 'going'
				? msToString(graphic.timeLeft)
				: graphic.duration
		}`
	} else if (graphic.type === 'icon_with_message') {
		label = `${graphic.body} (Message - ${graphic.id})`
		contents = `${graphic.body}`
	} else if (graphic.type === 'credits') {
		label = `${graphic.lead} (Credits - ${graphic.id})`
		contents = `${graphic.lead}`
	} else if (graphic.type === 'animated_background') {
		label = `${graphic.animationName} (Animated Background - ${graphic.id})`
		contents = `${graphic.animationName}`
	} else if (graphic.type === 'video') {
		label = `${graphic.name} (Video - ${graphic.id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'audio') {
		label = `${graphic.name} (Audio - ${graphic.id})`
		contents = `${graphic.name}`
	} else if (graphic.type === 'celebration') {
		label = `${graphic.celebrationType} (Celebration - ${graphic.id})`
		contents = `${graphic.celebrationType}`
	} else if (graphic.type === 'now_next_then') {
		label = `${graphic.items[0].sectionTitle} (Now next then - ${graphic.id})`
		contents = `${graphic.items[0].sectionTitle}`
	} else if (graphic.type === 'qr') {
		label = `${graphic.message} (QR code - ${graphic.id})`
		contents = `${graphic.message}`
	} else if (graphic.type === 'map') {
		label = `Map - ${graphic.id}`
		contents = `Map`
	} else if (graphic.type === 'checklist') {
		label = `${graphic.title} (Checklist - ${graphic.id})`
		contents = `${graphic.title}`
	} else if (graphic.type === 'utility_large_text') {
		label = `${graphic.text} (Large Text - ${graphic.id})`
		contents = `${graphic.text}`
	} else if (graphic.type === 'utility_time_of_day') {
		label = `Time of day (Time of Day - ${graphic.id})`
		contents = `Time of day`
	} else if (graphic.type === 'utility_pattern') {
		label = `Pattern - ${graphic.id}`
		contents = `Pattern`
	} else if (graphic.type === 'utility_speaker_timer') {
		label = `${msToString(graphic.duration)} (Speaker timer - ${graphic.id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else if (graphic.type === 'time_tod') {
		label = `Time of day (Time of Day - ${graphic.id})`
		contents = `Time of day`
	} else if (graphic.type === 'time_to_tod') {
		label = `To time of day (To time of Day - ${graphic.id})`
		contents = `To time of day`
	} else if (graphic.type === 'time_countdown' || graphic.type === 'big_time_countdown') {
		label = `${msToString(graphic.duration)} (Countdown timer - ${graphic.id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else if (graphic.type === 'time_countup' || graphic.type === 'big_time_countup') {
		label = `${msToString(graphic.duration)} (Count Up timer - ${graphic.id})`
		contents = ['running'].includes(graphic.state) ? `${graphic.endAt}` : `${msToString(graphic.duration)}`
	} else {
		label = `${graphic.type} (${graphic.id})`
		contents = `${graphic.type} (${graphic.id})`
	}

	return {
		id,
		label,
		contents,
	}
}

export const graphicColours = (graphic) => {
	const theGraphic = findGraphic(graphic)

	return { bgColour: theGraphic.bgColour }
}
export const graphicIcons = (graphic) => {
	const theGraphic = findGraphic(graphic)
	return { png: theGraphic.png }
}

import { msToString, stringToMS } from './utils.js'
import { getTimerVariables } from './variables.js'
import { DateTime, Duration } from 'luxon'
import { Color, Png, CueTypeIds, TimerType } from './constants.js'

/**
 * @typedef {import('./types.js').Cue} Cue
 * @typedef {import('./types.js').CueVariable} CueVariable
 */

/**
 *
 * @param {Cue} cue - the cue to check
 * @returns {boolean} - whether the cue is on air, coming or going
 */
export function isActive(cue) {
	return ['onair', 'coming', 'going'].includes(cue.status)
}

/**
 *
 * @param {Cue} cue - the cue to check
 * @returns {boolean} - whether the cue is running
 */
export function isRunning(cue) {
	return ['running'].includes(cue.state)
}

/**
 *
 * @param {Cue} cue - the cue to check
 * @returns { boolean } - whether the cue is paused or reset
 */
export function isPausedOrReset(cue) {
	return ['paused', 'reset'].includes(cue.state)
}

/**
 *
 * @param {Cue} cue - the cue to check
 * @returns { boolean } - whether the cue is reset
 */
export function isReset(cue) {
	return ['reset'].includes(cue.state)
}

/**
 *
 * @param {Cue} cue - the cue
 * @returns {CueVariable} - the cue as a variable
 */
export function cueToReadableLabel(cue) {
	const cueType = findCueType(cue.type)
	return {
		id: cue.id,
		label: cueType.label(cue),
		contents: cueType.contents(cue),
	}
}

/**
 *
 * @param {string} type - the type of cue
 * @returns {CueTypes} - the cue type object
 */
export function findCueType(type) {
	return CueTypes[type] || CueTypes['default']
}

export const CueTypes = {
	[CueTypeIds.LowerThird]: {
		png: Png.LowerThird,
		bgColor: Color.Orange,
		label(cue) {
			return `${cue.line_one}, ${cue.line_two} (Lower third - ${cue.id})`
		},
		contents(cue) {
			return `${cue.line_one}, ${cue.line_two}`
		},
	},
	[CueTypeIds.Message]: {
		png: Png.Message,
		bgColor: Color.Orange2,
		label(cue) {
			return `${cue.body} (Message) - ${cue.id})`
		},
		contents(cue) {
			return `${cue.body}`
		},
	},
	[CueTypeIds.Time]: {
		png: Png.Time,
		bgColor: Color.Salmon,
		label(cue) {
			if (cue.timerType === TimerType.ToTimeOfDay) {
				return `${isActive(cue) ? msToString(cue.timeLeft * 1000) : cue.endTime} (Time - ${cue.id})`
			}
			if (cue.timerType === TimerType.TimeOfDay) {
				return `Current time of day (Time - ${cue.id})`
			}

			return `${isActive(cue) ? msToString(cue.timeLeft) : cue.duration} (Time - ${cue.id})`
		},
		contents(cue) {
			if (cue.timerType === TimerType.ToTimeOfDay) {
				return `${isActive(cue) ? msToString(cue.timeLeft * 1000) : cue.endTime}`
			}
			if (cue.timerType === TimerType.TimeOfDay) {
				return `Current time of day`
			}

			return `${isActive(cue) ? msToString(cue.timeLeft) : cue.duration}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			if (cue.timerType === TimerType.ToTimeOfDay) {
				return DateTime.fromMillis(Number.parseInt(cue.endTimestamp, 10)).diff(DateTime.now())
			}

			if (cue.timerType === TimerType.TimeOfDay) {
				return DateTime.now()
			}

			return Duration.fromMillis(cue.timeLeft)
		},
	},

	[CueTypeIds.TimeCountdown]: {
		png: Png.Time,
		bgColor: Color.Salmon,
		label(cue) {
			return `${msToString(cue.duration)} (Countdown timer - ${cue.id})`
		},
		contents(cue) {
			return isRunning(cue) ? `${cue.endAt}` : `${msToString(cue.duration)}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			return getTimeForCountdown(cue)
		},
	},
	[CueTypeIds.TimeCountup]: {
		png: Png.Time,
		bgColor: Color.Salmon,
		label(cue) {
			return `${msToString(cue.duration)} (Countup timer - ${cue.id})`
		},
		contents(cue) {
			return isRunning(cue) ? `${cue.endAt}` : `${msToString(cue.duration)}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			const now = DateTime.now()
			const end = DateTime.fromMillis(cue.startedAt)
			return now.diff(end)
		},
	},
	[CueTypeIds.TimeTod]: {
		png: Png.Time,
		bgColor: Color.Salmon,
		label(cue) {
			return `Time of day (Time of Day - ${cue.id})`
		},
		contents(_cue) {
			return `Time of day`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(_cue) {
			return DateTime.now()
		},
	},
	[CueTypeIds.TimeToTod]: {
		png: Png.Time,
		bgColor: Color.Salmon,
		label(cue) {
			return `To time of day (To time of Day - ${cue.id})`
		},
		contents(_cue) {
			return `To time of day`
		},
		extraVariables(cue) {
			const t = new Date(cue?.endTime)?.getTime() || 0
			const time = t - new Date().getTime()

			return getTimerVariables(cue, time)
		},
	},
	[CueTypeIds.Image]: {
		png: Png.Image,
		bgColor: Color.Blue,
		label(cue) {
			return `${cue.name} (Image - ${cue.id})`
		},
		contents(cue) {
			return `${cue.name}`
		},
	},
	[CueTypeIds.Ticker]: {
		png: Png.Ticker,
		bgColor: Color.Blue2,
		label(cue) {
			return `${cue.title} (Ticker - ${cue.id})`
		},
		contents(cue) {
			return `${cue.title}`
		},
	},
	[CueTypeIds.Social]: {
		png: Png.Social,
		bgColor: Color.Purple,
		label(cue) {
			return `Social - ${cue.id}`
		},
		contents(cue) {
			return `${cue.chat.snippet.displayMessage}`
		},
		extraVariables(cue) {
			return [
				{
					variableId: `cue_${cue.id}_author`,
					name: `Social - Author (${cue.id})`,
					value: `${cue.chat.authorDetails.displayName}`,
				},
				{
					variableId: `cue_${cue.id}_author_profile_image_url`,
					name: `Social - Author Profile Image URL (${cue.id})`,
					value: `${cue.chat.authorDetails.profileImageUrl}`,
				},
				{
					variableId: `cue_${cue.id}_source`,
					name: `Social - Source (${cue.id})`,
					value: `${cue.chat.source}`,
				},
			]
		},
	},
	[CueTypeIds.Webpage]: {
		png: Png.Webpage,
		bgColor: Color.Purple2,
		label(cue) {
			return `${cue.url} (Webpage - ${cue.id})`
		},
		contents(cue) {
			return `${cue.url}`
		},
	},
	[CueTypeIds.Score]: {
		png: Png.Score,
		bgColor: Color.Green,
		label(cue) {
			return `Score - ${cue.id}`
		},
		contents(_cue) {
			return `Score`
		},
	},
	[CueTypeIds.BigTime]: {
		png: Png.BigTimer,
		bgColor: Color.Salmon,
		label(cue) {
			return `${isActive(cue) ? msToString(cue.timeLeft) : cue.duration} (Big timer - ${cue.id})`
		},
		contents(cue) {
			return `${isActive(cue) ? msToString(cue.timeLeft) : cue.duration}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			if (cue.timerType === TimerType.TimeOfDay) {
				return DateTime.now()
			}
			return isActive(cue) ? Duration.fromMillis(cue.timeLeft) : Duration.fromMillis(cue.durationMS)
		},
	},
	[CueTypeIds.LowerThirdAnimated]: {
		png: Png.LowerThirdAnimated,
		bgColor: Color.Yellow,
		label(cue) {
			return `${cue.line_one}, ${cue.line_two} (LT Animated - ${cue.id})`
		},
		contents(cue) {
			return `${cue.line_one}, ${cue.line_two}`
		},
		extraVariables(cue) {
			return [
				{
					variableId: `cue_${cue.id}_first_line`,
					name: this.label(cue),
					value: `${cue.line_one}`,
				},
			]
		},
	},
	[CueTypeIds.IconWithMessage]: {
		png: Png.IconWithMessage,
		bgColor: Color.Orange2,
		label(cue) {
			return `${cue.body} (Message - ${cue.id})`
		},
		contents(cue) {
			return `${cue.body}`
		},
	},
	[CueTypeIds.Credits]: {
		png: Png.Credits,
		bgColor: Color.Green,
		label(cue) {
			return `${cue.lead} (Credits - ${cue.id})`
		},
		contents(cue) {
			return `${cue.lead}`
		},
	},
	[CueTypeIds.ImageWithMessage]: {
		png: Png.ImageWithMessage,
		bgColor: Color.Brown,
		label(cue) {
			return `${cue.body} (Image with Message - ${cue.id})`
		},
		contents(cue) {
			return `${cue.body}`
		},
	},
	[CueTypeIds.Video]: {
		png: Png.Video,
		bgColor: Color.Purple3,
		label(cue) {
			return `${cue.name} (Video - ${cue.id})`
		},
		contents(cue) {
			return `${cue.name}`
		},
	},
	[CueTypeIds.Celebration]: {
		png: Png.Celebration,
		bgColor: Color.Purple4,
		label(cue) {
			return `${cue.celebrationType} (Celebration - ${cue.id})`
		},
		contents(cue) {
			return `${cue.celebrationType}`
		},
	},
	[CueTypeIds.AnimatedBackground]: {
		png: Png.AnimatedBackground,
		bgColor: Color.Blue3,
		label(cue) {
			return `${cue.animationName} (Animated Background - ${cue.id})`
		},
		contents(cue) {
			return `${cue.animationName}`
		},
	},
	[CueTypeIds.NowNextThen]: {
		png: Png.NowNextThen,
		bgColor: Color.Green2,
		label(cue) {
			return `${cue.items[0].sectionTitle} (Now next then - ${cue.id})`
		},
		contents(cue) {
			return `${cue.items[0].sectionTitle}`
		},
	},
	[CueTypeIds.Checklist]: {
		png: Png.Checklist,
		bgColor: Color.Purple5,
		label(cue) {
			return `${cue.title} (Checklist - ${cue.id})`
		},
		contents(cue) {
			return `${cue.title}`
		},
	},
	[CueTypeIds.QR]: {
		png: Png.QR,
		bgColor: Color.Green3,
		label(cue) {
			return `${cue.message} (QR code - ${cue.id})`
		},
		contents(cue) {
			return `${cue.message}`
		},
	},
	[CueTypeIds.Map]: {
		png: Png.Map,
		bgColor: Color.Blue4,
		label(cue) {
			return `Map - ${cue.id}`
		},
		contents(_cue) {
			return `Map`
		},
	},
	[CueTypeIds.Audio]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${cue.name} (Audio - ${cue.id})`
		},
		contents(cue) {
			return `${cue.name}`
		},
	},
	[CueTypeIds.UtilityLargeText]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${cue.text} (Large Text - ${cue.id})`
		},
		contents(cue) {
			return `${cue.text}`
		},
	},
	[CueTypeIds.UtilityTimeOfDay]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `Time of day - ${cue.id}`
		},
		contents(_cue) {
			return `Time of day`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(_cue) {
			return DateTime.now()
		},
	},
	[CueTypeIds.UtilityPattern]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `Pattern - ${cue.id}`
		},
		contents(_cue) {
			return `Pattern`
		},
	},
	[CueTypeIds.UtilitySpeakerTimer]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${msToString(cue.duration)} (Speaker timer - ${cue.id})`
		},
		contents(cue) {
			return isRunning(cue) ? `${cue.endAt}` : `${msToString(cue.duration)}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			return getTimeForCountdown(cue)
		},
	},
	[CueTypeIds.BigTimeCountdown]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${msToString(cue.duration)} (Countdown timer - ${cue.id})`
		},
		contents(cue) {
			return `${msToString(this.time(cue))}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			return getTimeForCountdown(cue)
		},
	},
	[CueTypeIds.BigTimeCountup]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${msToString(cue.duration)} (Count up timer - ${cue.id})`
		},
		contents(cue) {
			return isRunning(cue) ? `${cue.endAt}` : `${msToString(cue.duration)}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			if (cue.state === 'paused') {
				return cue.pausedTimeElapsed
			}
			if (cue.state === 'reset') {
				return stringToMS(cue.startOffset)
			}
			return isRunning(cue) ? new Date().getTime() - cue.startedAt : cue.duration
		},
	},
	[CueTypeIds.BigTimeToTod]: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `${cue.endTime} (Time to time of day - ${cue.id})`
		},
		contents(cue) {
			return isRunning(cue) ? `${cue.endTime}` : `${msToString(cue.duration)}`
		},
		extraVariables(cue) {
			return getTimerVariables(cue, this.time(cue))
		},
		time(cue) {
			const now = DateTime.now()
			const end = DateTime.fromISO(cue.endTime)
			return end.diff(now)
		},
	},
	default: {
		png: Png.empty,
		bgColor: Color.Black,
		label(cue) {
			return `Default - ${cue.id}`
		},
		contents(_cue) {
			return `Default`
		},
	},
}

/**
 *
 * @param {Cue} cue - the cue object
 * @returns {Duration | DateTime } - the time either as a duration or a datetime
 */
function getTimeForCountdown(cue) {
	if (cue.state === 'paused') {
		return Duration.fromMillis(cue.pausedTimeLeft)
	}

	return cue.state === 'reset' ? Duration.fromMillis(cue.duration) : DateTime.fromMillis(cue.endAt).diff(DateTime.now())
}

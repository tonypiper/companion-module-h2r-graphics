export const msToString = (ms = 0) => {
	let seconds = ms / 1000
	const hours = parseInt(seconds / 3600)
	seconds %= 3600
	const minutes = parseInt(seconds / 60)
	seconds = Math.ceil(seconds % 60)
	return `${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`}:${
		seconds < 10 ? `0${seconds}` : `${seconds === 60 ? '00' : seconds}`
	}`
}

export const stringToMS = (string = '00:00:00') => {
	let [h, m, s = '00'] = string.split(':')

	return (parseInt(h) * 60 * 60 + parseInt(m) * 60 + parseInt(s)) * 1000
}

import { CueTypeId, TimerCueTypeIds } from '../src/constants.js'
import { CueTypes } from '../src/graphics.js'
import { DateTime, Duration } from 'luxon'

const typeIds = Object.values(CueTypeId)

test('GraphicTypes has the same keys as GraphicTypeIds', () => {
	expect(CueTypeId.length).toEqual(CueTypes.length)
})

describe.each(typeIds)('GraphicType members and structure: %s', (typeId) => {
	const graphicType = CueTypes[typeId]

	test(`GraphicType defined for ${typeId}`, () => {
		expect(graphicType).toBeDefined()
	})

	test(`GraphicType has a valid background color`, () => {
		expect(graphicType.bgColor).toBeDefined()
		expect(typeof graphicType.bgColor).toBe('number')
	})

	test(`GraphicType returns a label`, () => {
		expect(graphicType.label).toBeDefined()
		expect(typeof graphicType.label).toBe('function')
		expect(typeof graphicType.label(testCue)).toBe('string')
	})

	test('contents is not empty', () => {
		const contents = graphicType.contents(testCue)
		expect(contents).toBeDefined()
		expect(contents).not.toHaveLength(0)
	})

	test('png is not empty', () => {
		expect(graphicType.png).toBeDefined()
		expect(graphicType.png).not.toHaveLength(0)
	})

	test('if it is a timer graphic type then the extraVaribles function is defined then it returns an array of object { variableId, name, value }', () => {
		if (!TimerCueTypeIds.includes(typeId)) {
			return
		}

		const extraVariables = graphicType.extraVariables(testCue)
		expect(extraVariables).toBeDefined()
		expect(extraVariables).not.toHaveLength(0)
		extraVariables.forEach((extraVariable) => {
			expect(extraVariable.variableId).toBeDefined()
			expect(extraVariable.name).toBeDefined()
			expect(extraVariable.value).toBeDefined()
		})
	})
})

const testCue = {
	id: 1,
	items: [{ sectionTitle: 'Section Title' }],
	chat: { authorDetails: { displayName: 'Display Name' }, snippet: { displayMessage: 'display message' } },
	startedAt: DateTime.now().minus(Duration.fromMillis(10000)).toMillis(),
	duration: 10000,
	endAt: DateTime.now().plus(Duration.fromMillis(10000)).toMillis(),
}

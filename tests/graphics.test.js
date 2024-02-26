import { CueTypeIds, TimerCueTypeIds, CueTypes } from '../src/graphics.js'

const typeIds = Object.values(CueTypeIds)

test('GraphicTypes has the same keys as GraphicTypeIds', () => {
	expect(CueTypeIds.length).toEqual(CueTypes.length)
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
		const graphic = { id: 1, items: [{ sectionTitle: 'Section Title' }] }

		expect(graphicType.label).toBeDefined()
		expect(typeof graphicType.label).toBe('function')
		expect(typeof graphicType.label(graphic)).toBe('string')
	})

	test('contents is not empty', () => {
		const contents = graphicType.contents({
			id: 1,
			chat: { snippet: { displayMessage: 'display message' } },
			items: [{ sectionTitle: 'Section Title' }],
		})
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

		const graphic = {
			id: 1,
			items: [{ sectionTitle: 'Section Title' }],
			chat: { authorDetails: { displayName: 'Display Name' } },
		}
		const extraVariables = graphicType.extraVariables(graphic)
		expect(extraVariables).toBeDefined()
		expect(extraVariables).not.toHaveLength(0)
		extraVariables.forEach((extraVariable) => {
			expect(extraVariable.variableId).toBeDefined()
			expect(extraVariable.name).toBeDefined()
			expect(extraVariable.value).toBeDefined()
		})
	})
})

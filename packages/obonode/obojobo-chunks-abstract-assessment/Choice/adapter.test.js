jest.mock('obojobo-document-engine/src/scripts/common/models/obo-model', () => {
	return require('obojobo-document-engine/__mocks__/obo-model-adapter-mock').default
})
import OboModel from 'obojobo-document-engine/src/scripts/common/models/obo-model'

import ChoiceAdapter from './adapter'

describe('Choice adapter', () => {
	test('construct builds without attributes', () => {
		const model = new OboModel({})
		ChoiceAdapter.construct(model)
		expect(model.modelState).toMatchObject({ score: '' })
	})

	test('construct builds with attributes', () => {
		const attrs = {
			content: {
				score: 999
			}
		}
		const model = new OboModel(attrs)

		ChoiceAdapter.construct(model, attrs)
		expect(model.modelState).toMatchObject({ score: 999 })
	})

	test('clone creates a copy', () => {
		const attrs = { content: { score: 999 } }
		const a = new OboModel(attrs)
		const b = new OboModel({})

		ChoiceAdapter.construct(a, attrs)
		ChoiceAdapter.clone(a, b)

		expect(a).not.toBe(b)
		expect(a.modelState).not.toBe(b.modelState)
		expect(a.modelState).toMatchObject(b.modelState)
	})

	test('toJSON builds a JSON representation', () => {
		const attrs = { content: { score: 777 } }
		const json = { content: {} }
		const model = new OboModel(attrs)

		ChoiceAdapter.construct(model, attrs)
		ChoiceAdapter.toJSON(model, json)

		expect(json).toMatchObject({ content: { score: 777 } })
	})
})

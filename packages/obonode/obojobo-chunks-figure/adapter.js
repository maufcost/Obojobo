import Common from 'obojobo-document-engine/src/scripts/common'

const { TextGroupAdapter } = Common.chunk.textChunk
const { TextGroup } = Common.textGroup

const Adapter = {
	construct(model, attrs) {
		// process the fig caption
		if (attrs && attrs.content && attrs.content.textGroup) {
			model.modelState.textGroup = TextGroup.fromDescriptor(attrs.content.textGroup, 1, {})
		} else {
			model.modelState.textGroup = TextGroup.create(1, {})
		}

		model.setStateProp('url', null)
		model.setStateProp('size', 'small', p => p.toLowerCase(), [
			'small',
			'medium',
			'large',
			'custom'
		])
		model.setStateProp('width', null, p => parseInt(p, 10))
		model.setStateProp('height', null, p => parseInt(p, 10))
		model.setStateProp('alt', null)
	},

	clone(model, clone) {
		TextGroupAdapter.clone(model, clone)
		clone.modelState.url = model.modelState.url
		clone.modelState.size = model.modelState.size
		clone.modelState.width = model.modelState.width
		clone.modelState.height = model.modelState.height
		clone.modelState.alt = model.modelState.alt
	},

	toJSON(model, json) {
		TextGroupAdapter.toJSON(model, json)
		json.content.url = model.modelState.url
		json.content.size = model.modelState.size
		json.content.width = model.modelState.width
		json.content.height = model.modelState.height
		json.content.alt = model.modelState.alt
	},

	toText(model) {
		return `Image: ${model.modelState.url}\n Caption: ${TextGroupAdapter.toText(model) ||
			model.modelState.alt}`
	}
}

export default Adapter

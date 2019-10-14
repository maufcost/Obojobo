import { Block } from 'slate'

import SchemaViolations from 'obojobo-document-engine/src/scripts/oboeditor/util/schema-violations'
import {
	NUMERIC_ASSESSMENT_NODE,
	SCORE_RULE_NODE,
	NUMERIC_FEEDBACK_NODE,
	NUMERIC_ANSWER
} from './constant'
const { CHILD_TYPE_INVALID, CHILD_MIN_INVALID } = SchemaViolations

const schema = {
	blocks: {
		[SCORE_RULE_NODE]: {
			isVoid: true
		},
		[NUMERIC_ANSWER]: {
			nodes: [
				{
					match: [{ type: SCORE_RULE_NODE }],
					min: 1
				},
				{
					match: [{ type: NUMERIC_FEEDBACK_NODE }]
				}
			],
			normalize: (editor, error) => {
				const { node, child, index } = error
				switch (error.code) {
					case CHILD_MIN_INVALID: {
						const block = Block.create({
							type: SCORE_RULE_NODE,
							isVoid: true,
							data: {
								numericRule: {
									requirement: 'Exact answer',
									answerInput: '',
									startInput: '',
									endInput: '',
									marginType: 'Absolute',
									precisionType: 'Significant digits',
									score: 100
								}
							}
						})
						return editor.insertNodeByKey(node.key, index, block)
					}
					case CHILD_TYPE_INVALID: {
						// extra children will be deleted by slate defaults
						if (index >= 2) return
						// multiple answers and feedbacks will be deleted by slate defaults
						if (index === 1 && child.type !== NUMERIC_FEEDBACK_NODE) return
						return editor.wrapBlockByKey(child.key, {
							type: SCORE_RULE_NODE,
							isVoid: true,
							data: {
								numericRule: {
									requirement: 'Exact answer',
									answerInput: '',
									startInput: '',
									endInput: '',
									marginType: 'Absolute',
									precisionType: 'Significant digits',
									score: 100
								}
							}
						})
					}
				}
			}
		},
		[NUMERIC_ASSESSMENT_NODE]: {
			nodes: [{ match: [{ type: NUMERIC_ANSWER }], min: 1 }],
			normalize: (editor, error) => {
				const { node, child, index } = error
				switch (error.code) {
					case CHILD_MIN_INVALID: {
						const block = Block.create({
							object: 'block',
							type: NUMERIC_ANSWER,
							nodes: []
						})
						return editor.insertNodeByKey(node.key, index, block)
					}
					case CHILD_TYPE_INVALID: {
						const block = Block.fromJSON({
							object: 'block',
							type: NUMERIC_ANSWER,
							nodes: []
						})
						return editor.withoutNormalizing(c => {
							c.removeNodeByKey(child.key)
							return c.insertNodeByKey(node.key, index, block)
						})
					}
				}
			}
		}
	}
}

export default schema

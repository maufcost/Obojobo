import './editor-component.scss'

import React from 'react'
import { Transforms } from 'slate'
import { ReactEditor } from 'slate-react'

import withSlateWrapper from 'obojobo-document-engine/src/scripts/oboeditor/components/node/with-slate-wrapper'
import NumericHeader from './numeric-header'
import NumericOption from './numeric-option'
import { fullTextToSimplifed } from '../constants'

const updateNumericChoice = (editor, element, updatedValues) => {
	const path = ReactEditor.findPath(editor, element)

	Transforms.setNodes(
		editor,
		{
			content: {
				...element.content,
				...updatedValues
			}
		},
		{ at: path }
	)
}

const NumericInput = props => {
	const onHandleInputChange = event => {
		const { name, value } = event.target

		updateNumericChoice(props.editor, props.element, {
			[name]: value
		})
	}

	const onClickDropdown = event => {
		const { name, value } = event.target

		if (name === 'requirement') {
			updateNumericChoice(props.editor, props.element, {
				[name]: fullTextToSimplifed[value],
				score: props.element.content.score,
				type: 'percent'
			})
		} else {
			updateNumericChoice(props.editor, props.element, {
				[name]: fullTextToSimplifed[value]
			})
		}
	}

	const content = props.element.content

	return (
		<div
			className="numeric-input-container"
			onClick={props.onSetCurrSelected}
			contentEditable={false}>
			<table contentEditable={false}>
				<thead>
					<NumericHeader requirement={content.requirement} />
				</thead>
				<tbody>
					<NumericOption
						editor={props.editor}
						numericChoice={content}
						onHandleInputChange={onHandleInputChange}
						onClickDropdown={onClickDropdown}
					/>
				</tbody>
			</table>
			{props.children}
		</div>
	)
}

export default withSlateWrapper(NumericInput)

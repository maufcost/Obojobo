import React from 'react'

import ClipboardUtil from '../../util/clipboard-util'
import Common from 'obojobo-document-engine/src/scripts/common'

import TriggerListModal from '../triggers/trigger-list-modal'

const { Button, Switch } = Common.components
const { TabTrap } = Common.components.modal
const { ModalUtil } = Common.util

// convenience function to reduce function creation in render
const stopPropagation = event => event.stopPropagation()

class EditInfoBox extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			currentId: this.props.currentId,
			needsUpdate: false, // NEED
			error: null, // NEED
			isOpen: false, // NEED
			modalOpen: false, // NEED
			content: this.props.content // NEED
		}

		this.handleIdChange = this.handleIdChange.bind(this)
		this.handleContentChange = this.handleContentChange.bind(this)
		this.handleSwitchChange = this.handleSwitchChange.bind(this)
		this.handleAbstractToggleChange = this.handleAbstractToggleChange.bind(this)

		this.showTriggersModal = this.showTriggersModal.bind(this)
		this.closeModal = this.closeModal.bind(this)

		this.onSave = this.onSave.bind(this)
		this.close = this.close.bind(this)

		this.idInput = React.createRef()
	}

	handleIdChange(event) {
		const currentId = event.target.value
		return this.setState({ currentId, needsUpdate: true })
	}

	handleContentChange(key, event) {
		stopPropagation(event)
		const newContent = {}
		newContent[key] = event.target.value

		this.setState(prevState => ({
			content: Object.assign({}, prevState.content, newContent),
			needsUpdate: true
		}))
	}

	handleSwitchChange(key, booleanValue) {
		const newContent = {}
		newContent[key] = booleanValue

		this.setState(prevState => ({
			content: Object.assign(prevState.content, newContent)
		}))
	}

	handleAbstractToggleChange(changeFn, booleanValue) {
		this.setState(prevState => ({ content: changeFn(prevState.content, booleanValue) }))
	}

	showTriggersModal() {
		// Preventing the edit info box from being closed when the modal is opened.
		ModalUtil.show(<TriggerListModal content={this.state.content} onClose={this.closeModal} />)
		this.setState({ modalOpen: true })
	}

	// TriggerListModal.onClose is called w/ no arguments when canceled
	// TriggerListModal.onClose is called w/ triggers when save+closed
	closeModal(modalState) {
		ModalUtil.hide()

		if (!modalState) return // do not save changes.

		this.setState(prevState => ({
			content: { ...prevState.content, triggers: modalState.triggers },
			needsUpdate: true,
			modalOpen: false
		}))
	}

	// this.props.saveContent
	// this.props.saveId
	// this.props.markUnsaved
	onSave() {
		// Saving the internal content to the editor state.
		const error =
			this.props.saveContent(this.props.content, this.state.content) ||
			this.props.saveId(this.props.id, this.state.currentId)

		if (!error) {
			// Wrapping these methods in a Timeout prevents a race condition with editor updates
			this.props.markUnsaved()
			this.close()
			return
		}

		// An error occurred
		this.setState({ error })
	}

	close() {
		if (this.state.isOpen === true) {
			if (this.props.onBlur) {
				this.props.onBlur('info')
				this.setState({ isOpen: false })
			}
		}
	}

	renderItem(description) {
		switch (description.type) {
			case 'input':
				return (
					<div key={description.description}>
						<label>{description.description}</label>
						<input
							type="text"
							value={this.state.content[description.name]}
							onChange={this.handleContentChange.bind(this, description.name)}
							placeholder={description.placeholder || ''}
							onClick={stopPropagation}
						/>
					</div>
				)
			case 'select':
				return (
					<div key={description.description}>
						<label>{description.description}</label>
						<select
							className="select-item"
							value={this.state.content[description.name]}
							onChange={this.handleContentChange.bind(this, description.name)}
							onClick={stopPropagation}
						>
							{description.values.map(option => (
								<option value={option.value} key={option.value}>
									{option.description}
								</option>
							))}
						</select>
					</div>
				)
			case 'toggle':
				return (
					<Switch
						key={description.description}
						title={description.description}
						initialChecked={this.state.content[description.name]}
						handleCheckChange={this.handleSwitchChange.bind(this, description.name)}
					/>
				)
			// Toggles complex things, like Lock Nav during Assessment Attempt
			case 'abstract-toggle':
				return (
					<Switch
						key={description.description}
						title={description.description}
						initialChecked={description.value(this.state.content)}
						handleCheckChange={this.handleAbstractToggleChange.bind(this, description.onChange)}
					/>
				)
		}
	}

	render() {

		const triggers = this.props.triggers

		return (
			<div className="more-info-box">
				<div className="container">
					<TabTrap focusOnFirstElement={() => this.idInput.current.focus()}>
						<div className="properties">
							<div>{this.props.type}</div>
							<div>
								<div>
									<label htmlFor="oboeditor--components--more-info-box--id-input">Id</label>
									<input
										autoFocus
										type="text"
										id="oboeditor--components--more-info-box--id-input"
										value={this.state.currentId}
										onChange={this.handleIdChange}
										className="id-input"
										onClick={stopPropagation}
										ref={this.idInput}
									/>
									<Button
										className="input-aligned-button"
										onClick={() => ClipboardUtil.copyToClipboard(this.state.currentId)}
									>
										Copy Id
									</Button>
								</div>
								{this.props.contentDescription.map(description => this.renderItem(description))}
							</div>
							<div>
								<span className="triggers">
									Triggers:
									{triggers && triggers.length > 0 ? (
										<span>
											{triggers
												.map(trigger => trigger.type)
												.reduce((accum, trigger) => accum + ', ' + trigger)}
										</span>
									) : null}
								</span>
								<Button altAction className="trigger-button" onClick={this.showTriggersModal}>
									✎ Edit
								</Button>
							</div>
							{/*
								this.props.deleteNode
								this.props.duplicateNode
								this.props.moveNode
							*/}
							{this.state.hideButtonBar ? null : (
								<div className="button-bar">
									<Button altAction isDangerous onClick={this.props.deleteNode}>
										Delete
									</Button>
									{!this.state.isAssessment ? (
										<Button altAction onClick={this.props.duplicateNode}>
											Duplicate
										</Button>
									) : null}
									{!this.state.showMoveButtons ? null : (
										<Button
											disabled={this.state.isFirst}
											altAction
											onClick={() => this.props.moveNode(this.props.index - 1)}
										>
											Move Up
										</Button>
									)}
									{!this.state.showMoveButtons ? null : (
										<Button
											disabled={this.state.isLast}
											altAction
											onClick={() => this.props.moveNode(this.props.index + 1)}
										>
											Move Down
										</Button>
									)}
								</div>
							)}
						</div>
						<div className="box-controls">
							{this.state.error ? <p className="error">{this.state.error}</p> : null}
							<Button onClick={this.onSave} className="cancel-button">
								Done
							</Button>
						</div>
					</TabTrap>
				</div>
			</div>
		)
	}
}

export default EditInfoBox

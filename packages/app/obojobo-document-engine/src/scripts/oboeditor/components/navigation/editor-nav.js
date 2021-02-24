import './editor-nav.scss'
// relies on styles from viewer
import '../../../viewer/components/nav.scss'

import Common from 'obojobo-document-engine/src/scripts/common'
import EditorUtil from '../../util/editor-util'
import React from 'react'
import SubMenu from './sub-menu'
import Header from './header'
import EditInfoBox from './edit-info-box'
import MoreInfoBox from './more-info-box'
import isOrNot from 'obojobo-document-engine/src/scripts/common/util/isornot'
import generatePage from '../../documents/generate-page'
import generateAssessment from '../../documents/generate-assessment'

const { Prompt } = Common.components.modal
const { ModalUtil } = Common.util

class EditorNav extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			openMoreInfoBox: false,
			triggers: null,
			type: null,
			id: null,
			currentId: null,
			contentDescription: null,
			content: null,
			hideButtonBar: null,
			isAssessment: null,
			showMoveButtons: null,
			isFirst: null,
			isLast: null,
			onBlur: null
		}

		// optimization - bind once instead of every render
		this.showAddPageModal = this.showAddPageModal.bind(this)
		this.showAddAssessmentModal = this.showAddAssessmentModal.bind(this)
		this.addAssessment = this.addAssessment.bind(this)
		this.addPage = this.addPage.bind(this)
		this.openTestBox = this.openTestBox.bind(this)

		this.deleteNode = this.deleteNode.bind(this)
		this.duplicateNode = this.duplicateNode.bind(this)
		this.moveNode = this.moveNode.bind(this)

		this.saveContent = this.saveContent.bind(this)
		this.saveId = this.saveId.bind(this)
		this.markUnsaved = this.markUnsaved.bind(this)
	}

	onNavItemClick(item) {
		EditorUtil.goto(item.id)
	}

	showAddAssessmentModal() {
		ModalUtil.show(
			<Prompt
				title="Add Assessment"
				message="Enter the title for the new assessment:"
				onConfirm={this.addAssessment}
			/>
		)
	}

	addAssessment(name = 'Assessment') {
		ModalUtil.hide()

		const newAssessment = generateAssessment()
		newAssessment.content.title = this.isWhiteSpace(name) ? 'Assessment' : name
		EditorUtil.addAssessment(newAssessment)
	}

	showAddPageModal() {
		ModalUtil.show(
			<Prompt
				title="Add Page"
				message="Enter the title for the new page:"
				onConfirm={this.addPage}
			/>
		)
	}

	addPage(title = null) {
		ModalUtil.hide()

		const newPage = generatePage()
		newPage.content.title = this.isWhiteSpace(title) ? null : title
		EditorUtil.addPage(newPage)
	}

	isWhiteSpace(str) {
		return !/[\S]/.test(str)
	}

	renderAddAssessmentButton() {
		return (
			<button className={'add-node-button'} onClick={this.showAddAssessmentModal}>
				+ Add Assessment
			</button>
		)
	}

	renderItems(list) {
		// If there are no pages in the nav list, add a placeholder item
		// The placeholder will render an Add Page button
		if (
			list.filter(
				item => item.type === 'no-pages' || (item.type !== 'heading' && !item.flags.assessment)
			).length < 1
		) {
			list.splice(1, 0, {
				type: 'no-pages'
			})
		}

		return list.map((item, index) => {
			switch (item.type) {
				case 'heading':
					return (
						<Header key={index} index={index} list={list} markUnsaved={this.props.markUnsaved} />
					)
				case 'link':
					return (
						<SubMenu
							key={index}
							index={index}
							isSelected={this.props.navState.navTargetId === item.id}
							list={list}
							onClick={this.onNavItemClick.bind(this, item)}
							savePage={this.props.savePage}
							markUnsaved={this.props.markUnsaved}
							openTestBox={this.openTestBox}
							isCallerInsideEditorNav={true}
						/>
					)
				case 'no-pages':
					return (
						<li key="1" className="no-pages-item">
							<button className="add-node-button" onClick={this.showAddPageModal}>
								+ Page
							</button>
						</li>
					)
				default:
					return null
			}
		})
	}

	openTestBox(
		triggers,
		type,
		id,
		currentId,
		contentDescription,
		content,
		hideButtonBar,
		isAssessment,
		showMoveButtons,
		isFirst,
		isLast,
		onBlur
	) {
		this.setState({
			openMoreInfoBox: true,
			triggers,
			type,
			id,
			currentId,
			contentDescription,
			content,
			hideButtonBar,
			isAssessment,
			showMoveButtons,
			isFirst,
			isLast,
			onBlur
		})
	}

	deleteNode() {
		console.log('deleteNode called')
	}

	duplicateNode() {
		console.log('duplicateNode called')
	}

	moveNode() {
		console.log('moveNode called')
	}

	saveContent() {
		console.log('saveContent called')
	}

	saveId() {
		console.log('saveId called')
	}

	markUnsaved() {
		console.log('markUnsaved called')
	}

	render() {
		const className =
			'visual-editor--draft-nav ' +
			isOrNot(this.props.navState.locked, 'locked') +
			isOrNot(this.props.navState.open, 'open') +
			isOrNot(!this.props.navState.disabled, 'enabled')

		const list = EditorUtil.getOrderedList(this.props.navState)

		const containsAssessment = list.filter(item => item.flags && item.flags.assessment).length > 0

		return (
			<div className={className}>
				<div className='sticky'>
					<ul>{this.renderItems(list)}</ul>
					{!containsAssessment ? this.renderAddAssessmentButton() : null}
				</div>
				{this.state.openMoreInfoBox ? (
					<MoreInfoBox
						deleteNode={this.deleteNode}
						duplicateNode={this.duplicateNode}
						moveNode={this.moveNode}
						saveContent={this.saveContent}
						saveId={this.saveId}
						markUnsaved={this.markUnsaved}
					/>
				) : null}
			</div>
		)
	}
}

// <EditInfoBox
// 	triggers={this.state.triggers}
// 	type={this.state.type}
// 	id={this.state.id}
// 	currentId={this.state.currentId}
// 	contentDescription={this.state.contentDescription}
// 	content={this.state.content}
// 	hideButtonBar={this.state.hideButtonBar}
// 	isAssessment={this.state.isAssessment}
// 	showMoveButtons={this.state.showMoveButtons}
// 	isFirst={this.state.isFirst}
// 	isLast={this.state.isLast}
// 	onBlur={this.state.onBlur}
// 	deleteNode={this.deleteNode}
// 	duplicateNode={this.duplicateNode}
// 	moveNode={this.moveNode}
// 	saveContent={this.saveContent}
// 	saveId={this.saveId}
// 	markUnsaved={this.markUnsaved}
// />

export default EditorNav

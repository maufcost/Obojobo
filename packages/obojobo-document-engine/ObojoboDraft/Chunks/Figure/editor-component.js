/* eslint no-alert: 0 */
import React from 'react'
import Common from 'Common'

import ImageProperties from './image-properties'

const { ModalUtil } = Common.util
const { Button } = Common.components
const isOrNot = Common.util.isOrNot

class Figure extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			imageIsSelected: false
		}

		this.handleClick = this.handleClick.bind(this)
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClick, false)
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClick, false)
	}

	handleClick(event) {
		if (!this.node) return
		if (this.node.contains(event.target)) return

		this.handleOutsideClick()
	}

	handleOutsideClick() {
		this.setState({ imageIsSelected: false })
	}

	onImageClick() {
		this.setState({ imageIsSelected: true })
	}

	showImagePropertiesModal() {
		ModalUtil.show(
			<ImageProperties
				content={this.props.node.data.get('content')}
				onConfirm={this.changeProperties.bind(this)}/>
		)
	}

	changeProperties(content) {
		const editor = this.props.editor
		const change = editor.value.change()

		ModalUtil.hide()

		change.setNodeByKey(this.props.node.key, {
			data: {
				content
			}
		})
		editor.onChange(change)
	}

	deleteNode() {
		const editor = this.props.editor
		const change = editor.value.change()

		change.removeNodeByKey(this.props.node.key)

		editor.onChange(change)
	}

	renderEditToolbar() {
		return (
			<div className="image-toolbar">
				<Button
					className="upload-button">
					Upload Image
				</Button>
				<Button
					className="properties-button"
					onClick={this.showImagePropertiesModal.bind(this)}>
					Image Properties
				</Button>
			</div>
		)
	}

	renderImage(isCustom, content, imgStyles) {
		return (
			isCustom ? (
				<img
					title={content.alt}
					src={content.url}
					unselectable="on"
					alt={content.alt}
					style={imgStyles}/>
			) : (
				<img
					title={content.alt}
					src={content.url}
					unselectable="on"
					alt={content.alt}/>
			)
		)
	}

	render() {
		const content = this.props.node.data.get('content')
		const isSelected = this.props.isSelected

		let isCustom = false
		const imgStyles = {}

		if (content.size === 'custom') {
			if (content.width) {
				imgStyles.width = content.width + 'px'
			}

			if (content.height) {
				imgStyles.height = content.height + 'px'
			}
			isCustom = true
		}

		const hasImage = content.url && content.url.length !== 0
		const hasAltText = content.alt && content.alt.length !== 0

		return (
			<div
				className={`obojobo-draft--chunks--figure viewer ` + content.size}
				ref={node => { this.node = node }}>
				<div className={'container'}>
					{hasAltText ? null : <div>Accessibility Warning: No Alt Text!</div>}
					<div
						className={'figure-box ' + isOrNot(isSelected || this.state.imageIsSelected, 'selected')}
						onClick={this.onImageClick.bind(this)}>
						<Button
							className="delete-button"
							onClick={this.deleteNode.bind(this)}>
							×
						</Button>
						{this.renderEditToolbar()}
						{hasImage ?
							this.renderImage(isCustom, content, imgStyles) :
							<div className="img-placeholder" contentEditable="false" />}
					</div>

					{/* uses children below because the caption is a textgroup */}
					<figcaption>{this.props.children}</figcaption>
				</div>
			</div>
		)
	}
}

export default Figure

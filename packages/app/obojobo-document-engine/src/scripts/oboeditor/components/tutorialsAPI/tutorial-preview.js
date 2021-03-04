import React from 'react'
import Common from 'obojobo-document-engine/src/scripts/common'
const { Button } = Common.components

import Gif1 from 'obojobo-document-engine/src/scripts/oboeditor/components/tutorialsAPI/gif1.gif'

import './tutorial-preview.css'

class TutorialPreview extends React.Component {

	componentDidMount() {
		console.log(this.props.tutorialLink)
		console.log(this.props.gifLink)
	}

	render() {
		return (
			<a
				className='tutorial-preview'
				rel='noreferrer'
				target='_blank'
				href={this.props.tutorialLink}
			>
				<img src={Gif1} />
				<div>
					<p>How to take advantage of pages in your Obojobo modules</p>
					<Button style={{ marginTop: '2em' }}>
						Watch now
					</Button>
				</div>
				<div className='arrow'></div>
			</a>
		)
	}
}

export default TutorialPreview;

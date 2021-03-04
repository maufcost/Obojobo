import React from 'react'
import Axios from 'axios'

import TutorialPreview from './tutorial-preview'

import './tutorial-button.css'

class TutorialButton extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			showPreview: false,
			tutorialLink: '',
			gifLink: ''
		};

		this.mountPreview = this.mountPreview.bind(this);
		this.unmountPreview = this.unmountPreview.bind(this);
	}

	mountPreview() {
		console.log('mounting tutorial preview');

		Axios({
			method: "GET",
			withCredentials: true,
			url: `http://localhost:3000/api/query/${this.props.actionId}`
		})
		.then((response) => {
			// console.log(response.data);
			// console.log("back on the client")
			this.setState({
				showPreview: true,
				tutorialLink: response.data.tutorial_link,
				gifLink: response.data.gif_link
			});
		}).catch((error) => {
			console.log('axios error')
			console.log(error)
		})
	}

	unmountPreview() {
		console.log('unmounting tutorial preview');
		setTimeout(() => {
			this.setState({ showPreview: false });
		}, 3000)
	}

	render() {
		return (
			<div
				className='tutorial-button'
				onMouseEnter={this.mountPreview}
				onMouseLeave={this.unmountPreview}
			>
				{this.state.showPreview ?
					<TutorialPreview
						tutorialLink={this.state.tutorialLink}
						gifLink={this.state.gifLink}
					/>
				: null}
			</div>
		)
	}
}

export default TutorialButton;

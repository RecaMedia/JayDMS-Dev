import React from 'react';

export default class Dashboard extends React.Component {

	constructor(props) {
		super(props);

		this.getTweets = this.getTweets.bind(this);
		this.getDate = this.getDate.bind(this);

		this.state = {
			tweets: []
		}
	}

	componentDidMount() {
		this.getTweets();
	}
	
	getTweets() {
		fetch("http://apps.recamedia.com/twitter/jaydms.json", {
			method: 'GET',
			mode: 'cors'
		}).then((response) => {
			return response.json();
		}).then((response) => {
			if (response.length) {
				this.setState({tweets: response});
			}
		}).catch((error) => {
			console.log(error);
		});
	}

	getDate(my_date) {
		let date_stamp = new Date(my_date);
		let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
		let monthIndex = date_stamp.getMonth();
		return monthNames[monthIndex] + ' ' + date_stamp.getDate();
	}

  render() {

		return (
			<div className="container">
				<h2>Dashboard</h2>
				<p className="lead">Your information board.</p>
				<div className="row">
					<div className="col-12">
						<div className="ui-card">
							<h5>Latest Tweets from JayDMS</h5>
							{this.state.tweets.map((tweet,i) => {
								return <div key={i} className="ui-tweet">
									<div className="ui-tweet__info-bar">
										<img src="https://pbs.twimg.com/profile_images/1183800166610067456/9AogP7ss_400x400.jpg"/>
										<a href="https://twitter.com/getJayDMS" target="_blank">@getJayDMS</a>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M492 109.5c-17.4 7.7-36 12.9-55.6 15.3 20-12 35.4-31 42.6-53.6-18.7 11.1-39.4 19.2-61.5 23.5C399.8 75.8 374.6 64 346.8 64c-53.5 0-96.8 43.4-96.8 96.9 0 7.6.8 15 2.5 22.1-80.5-4-151.9-42.6-199.6-101.3-8.3 14.3-13.1 31-13.1 48.7 0 33.6 17.2 63.3 43.2 80.7-16-.4-31-4.8-44-12.1v1.2c0 47 33.4 86.1 77.7 95-8.1 2.2-16.7 3.4-25.5 3.4-6.2 0-12.3-.6-18.2-1.8 12.3 38.5 48.1 66.5 90.5 67.3-33.1 26-74.9 41.5-120.3 41.5-7.8 0-15.5-.5-23.1-1.4C62.8 432 113.7 448 168.3 448 346.6 448 444 300.3 444 172.2c0-4.2-.1-8.4-.3-12.5C462.6 146 479 129 492 109.5z"/></svg>
										<div className="ui-tweet__date">{this.getDate(tweet.created_at)}</div>
									</div>
									<div className="ui-tweet__text" dangerouslySetInnerHTML={{__html: tweet.text}}/>
								</div>
							})}
						</div>
					</div>
				</div>
			</div>
		)
	}
}
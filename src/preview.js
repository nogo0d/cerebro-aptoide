
const React = require('react');
const axios = require('axios');

const style = require('../assets/main.css');

class Preview extends React.Component {

	constructor(props) {
		super(props);
		this.constructSearchUrl(props);
	}

	constructSearchUrl(props) {
		this.props.search_url = 'https://ws75.aptoide.com/api/7/apps/search?query=' + props.query + '&offset=0&limit=20&trusted=1&cdn=web&mature=1';
		if (props.store != null) {
			this.props.search_url += '&store_name=' + props.store
		}
	}

	componentDidMount(){
		this.doSearch();
	}

	componentWillReceiveProps(nextProps) {
		this.constructSearchUrl(nextProps);
		this.doSearch();
	}

	goSite (app_uname, store) {
		let app_url = 'https://' + app_uname + '.en.aptoide.com';
		if (store !== null){
			app_url += '?store_name=' + store;
		}
		this.props.actions.open(app_url);
		this.props.actions.hideWindow();
	};

	goDownload (app_path) {
		this.props.actions.open(app_path);
		this.props.actions.hideWindow();
	};

	doSearch() {
		axios.get(this.props.search_url,  {'timeout': 1000})
			.then(response => this.setState(response.data))
			.catch(error => {})
	}

	limitAppList() {
		this.state.datalist.list= this.state.datalist.list.slice(0, 7);
	}

	resizeAppIcons() {
		this.state.datalist.list.forEach(function(app, idx, list) {
			list[idx].icon = app.icon + '?w=40'
		});
	}

	handleKeyDown(e, select_callback) {
		if (e.keyCode !== 27){
			e.stopPropagation();
		}
		if (e.keyCode === 13) {
			select_callback();
		}
		if (e.keyCode === 40) {
			Preview.jumpNElementsIfPossible(e.target, 2);
		}
		if (e.keyCode === 38) {
			Preview.jumpNElementsIfPossible(e.target, -2);
		}
		if (e.keyCode === 39) {
			Preview.jumpNElementsIfPossible(e.target, 1);
		}
		if (e.keyCode === 37) {
			Preview.jumpNElementsIfPossible(e.target, -1);
		}
	}

	static jumpNElementsIfPossible(current_element, n_elements_to_jump) {
		let wanted_element_index = (current_element.getAttribute('data-tabIndex')*1)+n_elements_to_jump;
		let wanted_element_selector = "[data-tabIndex='" + wanted_element_index + "']";
		let wanted_element = document.querySelector(wanted_element_selector);
		let wanted_element_exist = wanted_element !== null;

		if (wanted_element_exist) {
			wanted_element.focus();
		}
	}

	getListTitle() {
		if(this.props.store !== null) {
			return <h1>Results for <span>{this.props.query}</span> in store <span>{this.props.store}</span>:</h1>
		}
		return <h1>Results for <span>{this.props.query}</span>:</h1>
	}

	render() {
		if (this.state !== null) {
			if (this.state.info.status !== null && this.state.info.status === 'OK' && this.state.datalist.list !== null && this.state.datalist.list.length > 0) {
				this.props.already_fetched = true;
				this.limitAppList();
				this.resizeAppIcons();
				return this.renderListResults();
			} else if (this.state.info.status !== null && this.state.info.status === 'OK' && this.state.datalist.list !== null && this.state.datalist.list.length === 0) {
				this.props.already_fetched = false;
				return 	this.renderEmptyList();
			} else if ((this.state.info === null || this.state.info.status !== null && this.state.info.status !== 'OK') && !this.props.already_fetched) {
				this.props.already_fetched = false;
				return this.renderGenericError()
			}
		}
		return Preview.renderWaitingForInput();
	}

	renderEmptyList() {
		return 	<div className={style.searchHolder} style={{ alignSelf: 'flex-start', width: '100%' }}>
					{this.getListTitle()}
					<div className={style.emptyListMessage}>No Results were found.</div>
				</div>
	}

	renderGenericError() {
		return 	<div className={style.searchHolder} style={{ alignSelf: 'flex-start', width: '100%' }}>
					{this.getListTitle()}
					<div className={style.emptyListMessage}>Ooops... Something went wrong...</div>
				</div>
	}

	renderListResults() {
		return 	<div className={style.searchHolder} style={{ alignSelf: 'flex-start', width: '100%' }}>
					{this.getListTitle()}
					{
						this.state.datalist.list.map(
							(app, idx) => (
								<div data-tabIndex={idx*2} tabIndex="0" className={style.app} onClick={(e) => {
									let store = this.props.store !== null ? this.props.store : null;
									e.stopPropagation();
									this.goSite(app.uname, store);
								}} onKeyDown={(e) => {
									var fake_this = this;
									this.handleKeyDown(e, function(){
										let store = fake_this.props.store !== null ? fake_this.props.store : null;
										fake_this.goSite(app.uname, store)
									});
								}}>
									<table width="100%">
										<tr>
											<td width="40">
												<img src={app.icon} />
											</td>
											<td>
												<div className={style.appInfo}>
													<h2>{app.name}</h2>
													<div className={style.statistics}>
														<p>
															<span>Downloads: </span> {app.stats.pdownloads}
														</p>
														<p>
															<span>Version: </span> {app.file.vername} | <span>Rating: </span> {app.stats.prating.avg} / {app.stats.prating.total}
														</p>
													</div>
												</div>
											</td>
										</tr>
									</table>
									<div data-tabIndex={(idx*2)+1} tabIndex="0" className={style.download}
										 onClick={(e) => {
											 e.stopPropagation();
											 this.goDownload(app.file.path)
										 }}
										 onKeyDown={(e) => {
											 var fake_this = this;
											 this.handleKeyDown(e, function (){
												 fake_this.goDownload(app.file.path)
											 });
										 }}> Download </div>
								</div>
							)
						)
					}
				</div>
	}

	static renderWaitingForInput() {
		return 	<div className={style.searchHolder} style={{ alignSelf: 'flex-start', width: '100%' }}>
			<div className={style.emptyListMessage}>Start searching for Aptoide Apps.</div>
		</div>
	}
}

Preview.propTypes = {
	query: React.PropTypes.string.isRequired,
};

module.exports = Preview;

import assert from 'assert'

import {
	isObject,
	isFunction,
	includes,
	kebabCase
} from 'lodash'

import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import { Router, Link } from 'react-router'

/*----------------------------------*/

export function appAware(ComponentToWrap){
	class AppComponent extends Component {
		render() {
			const { app, sizeClassHelper, Link, route, transition } = this.context;
			return (
				<ComponentToWrap {...this.props} 
					app={app}
					sizeClassHelper={sizeClassHelper} 
					Link={Link}
					route={route}
					transition={transition}
				/>
			)
		}
	}

	AppComponent.contextTypes = {
		app: PropTypes.object.isRequired,
		sizeClassHelper: PropTypes.object.isRequired,
		Link: PropTypes.func.isRequired,
		route: PropTypes.object.isRequired,
		transition: PropTypes.object
	}

	return AppComponent
}

/*--------------------------------*/

class _AppRouteTransitionLayout extends Component{
	constructor(){
		super(...arguments);

		this.lastPath = null;
		this.state = {};
	}

	render(){
		let newPath = this.props.location.pathname;

		let kebabCasedLast = this.lastPath ? kebabCase(this.lastPath) : '';
		let from = 'from-'+(kebabCasedLast.length > 0 ? kebabCasedLast : 'index');

		let kebabCasedNew = kebabCase(newPath);
		let to = 'to-'+kebabCase(kebabCasedNew.length > 0 ? kebabCasedNew : 'index');

		this.lastPath = newPath;
		let transitionList = this.props.transition || {};

		let defaultTransition = {
			name: from+'-'+to,
			component: 'div',
			appear: false,
			appearTimeout: 500,
			enter: false,
			enterTimeout: 500,
			leave: false,
			leaveTimeout: 500
		};

		let transition = isObject(transitionList[from+'-'+to]) ? transitionList[from+'-'+to] : (
			isObject(transitionList['default']) ? transitionList['default'] : defaultTransition
		);

		return(
			<ReactCSSTransitionGroup
				className={"App-route-transition-"+(transition.name || defaultTransition.name)}
				component={(transition.component || defaultTransition.component)}
				transitionName={{
					appear: 'appear',
					enter: 'enter',
					leave: 'leave'
				}}
				transitionAppear={(transition.appear || defaultTransition.appear)}
				transitionAppearTimeout={(transition.appearTimeout || defaultTransition.appearTimeout)}
				transitionEnter={(transition.enter || defaultTransition.enter)}
				transitionEnterTimeout={(transition.enterTimeout || defaultTransition.enterTimeout)}
				transitionLeave={(transition.leave || defaultTransition.leave)}
				transitionLeaveTimeout={(transition.leaveTimeout || defaultTransition.leaveTimeout)}
			>
				{React.cloneElement(this.props.children, {
					key: newPath
				})}
			</ReactCSSTransitionGroup>
		)
	}
};

export let AppRouteTransitionLayout = appAware(_AppRouteTransitionLayout);

/*-------------------------------*/

export default class App extends Component{
	constructor(props) {
		super(...arguments);

		this.state = {
			mustActiveFastClick: this.props.fastclick === true
		}
	}

	static get defaultProps(){
		return {
			title: getTagTitleContent(),
			fastclick: false,
			description: getMetaDescription()
		};
	}

	static get propTypes() {
		return {
			sizeClassHelper: PropTypes.object.isRequired,
			rootRoute: PropTypes.object.isRequired,
			routes: PropTypes.object.isRequired,
			history: PropTypes.object.isRequired
		}
	}

	getChildContext() {
		return {
			app: this,
			sizeClassHelper: this.props.sizeClassHelper,
			Link,
			route: this.props.routes,
			transition: this.props.transition
		}
	}

	static get childContextTypes() {
		return {
			app: PropTypes.object.isRequired,
			sizeClassHelper: PropTypes.object.isRequired,
			Link: PropTypes.func.isRequired,
			route: PropTypes.object.isRequired,
			transition: PropTypes.object
		}
	}

	/*----------------------*/

	componentDidUpdate(prevProps){
		if(this.props.title !== prevProps.title){
			setTagTitleContent(this.props.title);
		}

		if(this.props.description !== prevProps.description){
			setMetaDescription(this.props.description);
		}
	}

	componentDidMount(){
		if(this.state.mustActiveFastClick){
			require.ensure([], function(require) {
				let fastClick = require('fastclick');
				new fastClick(document.body);
			});
		}

		this.componentDidUpdate({}, {});
	}

	render(){
		return (
			<div className='App'>
				<Router routes={this.props.rootRoute} history={this.props.history}/>
			</div>
		)
	}
}

/*-------------------------*/

function getTagTitleContent(){
	let title = document.querySelector('title');
	
	return title ? title.innerHTML : 'App';
}

function setTagTitleContent(titleContent){
	let title = document.querySelector('title');

	title ? title.innerHTML = titleContent : null;
}

function getMetaDescription(){
	let metaDescription = document.querySelector('meta[name="description"]');

	return metaDescription ? metaDescription.getAttribute('content') : '';
}

function setMetaDescription(description){
	let metaDescription = document.querySelector('meta[name="description"]');

	metaDescription ? metaDescription.setAttribute('content', description) : null;
}

const Dashboard = require('./dashboard')
const connect = require('react-redux').connect
const {
	closeModal,
	addUserToModule,
	loadUsersForModule,
	deleteModulePermissions,
	createNewModule,
	filterModules,
	deleteModule,
	showModulePermissions,
	importModuleFile
} = require('../actions/dashboard-actions')
const mapStoreStateToProps = state => state
const mapActionsToProps = {
	createNewModule,
	closeModal,
	addUserToModule,
	loadUsersForModule,
	deleteModulePermissions,
	filterModules,
	deleteModule,
	showModulePermissions,
	importModuleFile
}
module.exports = connect(
	mapStoreStateToProps,
	mapActionsToProps
)(Dashboard)

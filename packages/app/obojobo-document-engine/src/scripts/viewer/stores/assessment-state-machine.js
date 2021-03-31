import { Machine, interpret, assign } from 'xstate'

import Common from 'Common'
import AssessmentNetworkStates from './assessment-store/assessment-network-states'
import AssessmentStateActions from './assessment-store/assessment-state-actions'
import NavUtil from '../util/nav-util'

import AssessmentStateHelpers from './assessment-state-helpers'
import AssessmentUtil from '../util/assessment-util'

const { OboModel } = Common.models

const {
	INIT,
	PROMPTING_FOR_RESUME,
	// PRE_STARTING_ATTEMPT,
	STARTING_ATTEMPT,
	RESUMING_ATTEMPT,
	IN_ATTEMPT,
	START_ATTEMPT_FAILED,
	RESUME_ATTEMPT_FAILED,
	// TRYING_TO_SUBMIT,
	SENDING_RESPONSES,
	SEND_RESPONSES_SUCCESSFUL,
	SEND_RESPONSES_FAILED,
	NOT_IN_ATTEMPT,
	ENDING_ATTEMPT,
	END_ATTEMPT_FAILED,
	END_ATTEMPT_SUCCESSFUL,
	PROMPTING_FOR_IMPORT,
	IMPORTING_ATTEMPT,
	IMPORT_ATTEMPT_FAILED,
	// IMPORT_ATTEMPT_SUCCESSFUL,
	FETCHING_ATTEMPT_HISTORY,
	FETCH_HISTORY_FAILED
} = AssessmentNetworkStates

const {
	FETCH_ATTEMPT_HISTORY,
	START_ATTEMPT,
	// PROMPT_FOR_IMPORT,
	// PROMPT_FOR_RESUME,
	IMPORT_ATTEMPT,
	ABANDON_IMPORT,
	RESUME_ATTEMPT,
	// TRY_TO_SUBMIT,
	SEND_RESPONSES,
	ACKNOWLEDGE,
	END_ATTEMPT,
	CONTINUE_ATTEMPT
	// RETRY
} = AssessmentStateActions

const updateContextWithAssessmentResponse = assign({
	// When the src function is completed the results will be
	// put into event.data. It will then call this action. assign() will
	// set the contents of event.data into this machine's context,
	// therefore making context.currentAttempt = the attempt data
	// returned by AssessmentStateHelpers.startAttempt

	assessmentStoreState: (context, event) => {
		const assessmentContext = getAssessmentContext(context)

		assessmentContext.current = event.data.value
		assessmentContext.attemptHistoryNetworkState === 'none'

		return context.assessmentStoreState
	}
})

const updateContextWithAttemptHistoryResponse = assign({
	assessmentStoreState: (context, event) => {
		const state = context.assessmentStoreState
		const attemptsByAssessment = event.data.value

		// copy data into our state
		attemptsByAssessment.forEach(assessmentItem => {
			const { assessmentId } = assessmentItem

			const newAssessmentState = AssessmentStateHelpers.getUpdatedAssessmentData(assessmentItem)
			const newAssessmentSummary = AssessmentStateHelpers.getStateSummaryFromAssessmentState(
				newAssessmentState
			)

			state.assessments[assessmentId] = newAssessmentState
			state.assessmentSummaries[assessmentId] = newAssessmentSummary

			delete state.importableScores[assessmentId]

			AssessmentStateHelpers.updateQuestionStore(assessmentItem)
		})

		return state
	}
})

const updateContextWithCurrentAttemptError = assign({
	assessmentStoreState: (context, event) => {
		const assessmentContext = getAssessmentContext(context)

		if (!assessmentContext.current) {
			assessmentContext.current = {}
		}

		assessmentContext.current.error = event.data.message

		return context.assessmentStoreState
	}
})

const logError = (context, event) => {
	console.error(event.data) // eslint-disable-line no-console
}

const getAssessmentContext = context => {
	return context.assessmentStoreState.assessments[context.assessmentId]
}

class AssessmentStateMachine {
	constructor(assessmentId, assessmentStoreState) {
		this.isStarted = false
		//eslint-disable-next-line new-cap
		this.machine = Machine(
			{
				id: 'assessment',
				initial: INIT,
				context: {
					assessmentId,
					assessmentStoreState
				},
				states: {
					[INIT]: {
						// "always" means we will transition to one of these states automatically
						// once this state is entered (which will happen once the machine is running
						// since INIT is the initial state!)
						always: [
							{ target: PROMPTING_FOR_RESUME, cond: 'isAttemptNeedingToBeResumed' },
							{ target: NOT_IN_ATTEMPT, cond: 'isNotResuming' }
						]
					},
					[NOT_IN_ATTEMPT]: {
						on: {
							[FETCH_ATTEMPT_HISTORY]: {
								target: FETCHING_ATTEMPT_HISTORY,
								cond: 'isAttemptHistoryNotLoaded'
							},
							[START_ATTEMPT]: [
								{
									target: STARTING_ATTEMPT,
									cond: 'isNoImportAvailable'
								},
								{
									target: PROMPTING_FOR_IMPORT,
									cond: 'isImportAvailable'
								}
							]
						}
					},
					[FETCHING_ATTEMPT_HISTORY]: {
						invoke: {
							id: 'fetchAttemptHistory',
							src: async context => {
								return await AssessmentStateHelpers.getAttemptHistoryWithReviewData(
									context.assessmentId
								)
							},
							onDone: {
								target: NOT_IN_ATTEMPT,
								actions: [updateContextWithAttemptHistoryResponse]
							},
							onError: {
								target: FETCH_HISTORY_FAILED,
								actions: [logError]
							}
						}
					},
					[FETCH_HISTORY_FAILED]: {
						on: {
							[FETCH_ATTEMPT_HISTORY]: FETCHING_ATTEMPT_HISTORY,
							[ACKNOWLEDGE]: NOT_IN_ATTEMPT
						}
					},
					// [PRE_STARTING_ATTEMPT]: {
					// 	always: [
					// 		{ target: STARTING_ATTEMPT, cond: 'isNoImportAvailable' },
					// 		{ target: PROMPTING_FOR_IMPORT, cond: 'isImportAvailable' }
					// 	]
					// },
					[STARTING_ATTEMPT]: {
						invoke: {
							id: 'startAttempt',
							src: async context => {
								return await AssessmentStateHelpers.startAttempt(context.assessmentId)
							},
							onDone: {
								target: IN_ATTEMPT,
								actions: [updateContextWithAssessmentResponse]
							},
							onError: {
								target: START_ATTEMPT_FAILED,
								actions: [logError, updateContextWithCurrentAttemptError]
							}
						}
					},
					[PROMPTING_FOR_IMPORT]: {
						on: {
							[ABANDON_IMPORT]: STARTING_ATTEMPT,
							[IMPORT_ATTEMPT]: IMPORTING_ATTEMPT
						}
					},
					[IMPORTING_ATTEMPT]: {
						invoke: {
							id: 'importAttempt',
							src: async context => {
								return await AssessmentStateHelpers.importAttempt(
									context.assessmentId,
									context.assessmentStoreState.importableScores[context.assessmentId]
										.assessmentScoreId
								)
							},
							onDone: {
								target: END_ATTEMPT_SUCCESSFUL,
								// actions: [updateContextRemoveImportableScore]
								actions: [updateContextWithAttemptHistoryResponse]
							},
							onError: {
								target: IMPORT_ATTEMPT_FAILED,
								actions: [logError, updateContextWithCurrentAttemptError]
							}
						}
					},
					[PROMPTING_FOR_RESUME]: {
						invoke: {
							id: 'promptingForResume',
							src: context => {
								NavUtil.goto(context.assessmentId)
							}
						},
						on: {
							[RESUME_ATTEMPT]: RESUMING_ATTEMPT
						}
					},
					[RESUMING_ATTEMPT]: {
						invoke: {
							id: 'resumeAttempt',
							src: async context => {
								const assessmentModel = OboModel.models[context.assessmentId]
								const attemptId = AssessmentUtil.getUnfinishedAttemptId(
									context.assessmentStoreState,
									assessmentModel
								)

								return await AssessmentStateHelpers.resumeAttempt(assessmentId, attemptId)
							},
							onDone: {
								target: IN_ATTEMPT,
								actions: updateContextWithAssessmentResponse
							},
							onError: {
								target: RESUME_ATTEMPT_FAILED,
								actions: [logError, updateContextWithCurrentAttemptError]
							}
						}
					},
					[IN_ATTEMPT]: {
						on: {
							[SEND_RESPONSES]: SENDING_RESPONSES
						}
					},
					[START_ATTEMPT_FAILED]: {
						on: {
							[ACKNOWLEDGE]: NOT_IN_ATTEMPT
						}
					},
					[IMPORT_ATTEMPT_FAILED]: {
						on: {
							[ACKNOWLEDGE]: NOT_IN_ATTEMPT
						}
					},
					[RESUME_ATTEMPT_FAILED]: {
						on: {
							[ACKNOWLEDGE]: PROMPTING_FOR_RESUME
						}
					},
					[SENDING_RESPONSES]: {
						invoke: {
							id: 'sendingResponses',
							src: async context => {
								const { assessmentId, attemptId } = getAssessmentContext(context).current
								return await AssessmentStateHelpers.sendResponses(assessmentId, attemptId)
							},
							onDone: SEND_RESPONSES_SUCCESSFUL,
							onError: {
								target: SEND_RESPONSES_FAILED,
								actions: [logError, updateContextWithCurrentAttemptError]
							}
						}
					},
					[SEND_RESPONSES_SUCCESSFUL]: {
						on: {
							[END_ATTEMPT]: ENDING_ATTEMPT,
							[CONTINUE_ATTEMPT]: IN_ATTEMPT
						}
					},
					[SEND_RESPONSES_FAILED]: {
						on: {
							// retry: SENDING_RESPONSES,
							[CONTINUE_ATTEMPT]: IN_ATTEMPT
						}
					},
					[ENDING_ATTEMPT]: {
						invoke: {
							id: 'endAttempt',
							src: async context => {
								const { assessmentId, attemptId } = getAssessmentContext(context).current

								return await AssessmentStateHelpers.endAttempt(assessmentId, attemptId)
							},
							onDone: {
								target: END_ATTEMPT_SUCCESSFUL,
								actions: [updateContextWithAttemptHistoryResponse]
							},
							onError: {
								target: END_ATTEMPT_FAILED,
								actions: [logError, updateContextWithCurrentAttemptError]
							}
						}
					},
					[END_ATTEMPT_SUCCESSFUL]: {
						on: {
							[ACKNOWLEDGE]: NOT_IN_ATTEMPT
						}
					},
					[END_ATTEMPT_FAILED]: {
						on: {
							[ACKNOWLEDGE]: IN_ATTEMPT
						}
					}
				}
			},
			{
				guards: {
					isImportAvailable: context => {
						const model = OboModel.models[context.assessmentId]
						return (
							AssessmentUtil.getImportableScoreForModel(context.assessmentStoreState, model) !==
							null
						)
					},
					isNoImportAvailable: context => {
						const model = OboModel.models[context.assessmentId]
						return (
							AssessmentUtil.getImportableScoreForModel(context.assessmentStoreState, model) ===
							null
						)
					},
					isNotResuming: context => {
						const model = OboModel.models[context.assessmentId]
						return !AssessmentUtil.hasUnfinishedAttempt(context.assessmentStoreState, model)
					},
					isAttemptNeedingToBeResumed: context => {
						const model = OboModel.models[context.assessmentId]
						return AssessmentUtil.hasUnfinishedAttempt(context.assessmentStoreState, model)
					},
					isAttemptHistoryNotLoaded: context => {
						const assessmentContext = getAssessmentContext(context)
						return assessmentContext.attemptHistoryNetworkState === 'none'
					}
				}
			}
		)

		this.service = interpret(this.machine)
	}

	send(action) {
		this.service.send(action)
	}

	getCurrentState() {
		return this.service.state.value
	}

	start(onTransition) {
		if (this.isStarted) {
			return
		}

		this.isStarted = true
		this.service.onTransition((state, oldValues) => {
			if (!state.changed) {
				return
			}

			onTransition(this, state, oldValues)
		})

		this.service.start()
	}

	stop() {
		this.service.stop()
	}
}

export default AssessmentStateMachine

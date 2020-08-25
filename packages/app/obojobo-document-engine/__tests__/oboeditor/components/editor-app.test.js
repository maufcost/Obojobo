import React from 'react'
import { mount } from 'enzyme'

import EditorApp from 'src/scripts/oboeditor/components/editor-app'

jest.mock('src/scripts/oboeditor/components/visual-editor')
jest.mock('src/scripts/oboeditor/components/code-editor')

import APIUtil from 'src/scripts/viewer/util/api-util'
jest.mock('src/scripts/viewer/util/api-util')
import EditorStore from 'src/scripts/oboeditor/stores/editor-store'
jest.mock('src/scripts/oboeditor/stores/editor-store')
import ModalStore from 'src/scripts/common/stores/modal-store'
jest.mock('src/scripts/common/stores/modal-store')
import ModalUtil from 'src/scripts/common/util/modal-util'
jest.mock('src/scripts/common/util/modal-util')
import Common from 'src/scripts/common'
import testObject from 'test-object.json'
import mockConsole from 'jest-mock-console'
let restoreConsole

const XML_MODE = 'xml'

describe('EditorApp', () => {
	beforeEach(() => {
		jest.resetAllMocks()
		jest.restoreAllMocks()
		restoreConsole = mockConsole('error')
	})

	afterEach(() => {
		restoreConsole()
	})

	test('component renders', done => {
		expect.hasAssertions()

		const spyGetItems = jest.spyOn(Common.Registry, 'getItems')
		spyGetItems.mockImplementationOnce(cb => {
			cb([{ plugins: 'mock-plugin' }, { noplugins: 'mock-plugin' }])
		})

		const spyModelCreate = jest.spyOn(Common.models.OboModel, 'create')
		spyModelCreate.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
		EditorStore.getState.mockReturnValueOnce({})

		const component = mount(<EditorApp />)
		setTimeout(() => {
			component.update()

			expect(component.html()).toMatchSnapshot()

			component.unmount()
			done()
		})
	})

	test('EditorApp component displays xml', done => {
		expect.assertions(1)

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft
			.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
			.mockResolvedValueOnce(
				'<?xml version="1.0" encoding="utf-8"?><ObojoboDraftDoc></ObojoboDraftDoc>'
			)
		EditorStore.getState.mockReturnValueOnce({})

		const component = mount(<EditorApp />)
		component.instance().switchMode(XML_MODE)

		setTimeout(() => {
			component.update()
			expect(component.html()).toMatchSnapshot()
			component.unmount()
			done()
		})
	})

	test('EditorApp component with no draft', done => {
		expect.assertions(1)

		// No visit or draft id
		jest.spyOn(String.prototype, 'split').mockReturnValueOnce([])

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
		EditorStore.getState.mockReturnValueOnce({})

		const component = mount(<EditorApp />)
		setTimeout(() => {
			component.update()

			expect(component.html()).toMatchSnapshot()

			component.unmount()
			done()
		})
	})

	test('onEditorStoreChange calls Editor.getState', done => {
		expect.assertions(1)

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
		EditorStore.getState.mockReturnValueOnce({}).mockReturnValueOnce({})

		const component = mount(<EditorApp />)
		setTimeout(() => {
			component.update()

			component.instance().onEditorStoreChange()
			expect(EditorStore.getState).toHaveBeenCalled()

			component.unmount()
			done()
		})
	})

	test('onModalStoreChange calls ModalStore.getState', done => {
		expect.assertions(1)

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
		EditorStore.getState.mockReturnValueOnce({}).mockReturnValueOnce({})
		ModalStore.getState.mockReturnValueOnce({}).mockReturnValueOnce({})

		const component = mount(<EditorApp />)
		setTimeout(() => {
			component.update()

			component.instance().onModalStoreChange()
			expect(ModalStore.getState).toHaveBeenCalled()

			component.unmount()
			done()
		})
	})

	test('EditorApp component renders error messsage', () => {
		expect.assertions(2)

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		const mockError = { type: 'someType', message: 'someMessage' }
		APIUtil.getFullDraft.mockResolvedValueOnce(
			JSON.stringify({
				status: 'error',
				value: mockError
			})
		)

		const component = mount(<EditorApp />)

		// eslint-disable-next-line no-undef
		return flushPromises().then(() => {
			component.update()
			expect(component.html()).toMatchSnapshot()
			// eslint-disable-next-line no-console
			expect(console.error).toHaveBeenCalledWith(mockError)
			component.unmount()
		})
	})

	test('EditorApp component renders modal', () => {
		expect.assertions(2)

		jest.spyOn(Common.models.OboModel, 'create')
		Common.models.OboModel.create.mockReturnValueOnce({
			modelState: { start: 'mockStart' }
		})

		APIUtil.getFullDraft.mockResolvedValueOnce(JSON.stringify({ value: testObject }))
		EditorStore.getState.mockReturnValueOnce({})

		ModalUtil.getCurrentModal.mockReturnValueOnce({
			component: 'mock component'
		})

		const component = mount(<EditorApp />)

		// eslint-disable-next-line no-undef
		return flushPromises().then(() => {
			component.update()
			expect(component.html()).toMatchSnapshot()
			// eslint-disable-next-line no-console
			expect(console.error).not.toHaveBeenCalled()
			component.unmount()
		})
	})

	test('EditorApp component loads draft revision', () => {
		expect.assertions(3)

		APIUtil.getDraftRevision.mockResolvedValueOnce({ value: { json: testObject } })
		EditorStore.getState.mockReturnValueOnce({})

		const props = {
			settings: {
				revisionId: 'mockId'
			}
		}
		const spy = jest.spyOn(EditorApp.prototype, 'loadDraftRevision')
		const component = mount(<EditorApp {...props} />)

		// eslint-disable-next-line no-undef
		return flushPromises().then(() => {
			component.update()

			expect(spy).toHaveBeenCalled()
			expect(component.state().mode).toEqual('visual')
			expect(component.state().draft).toEqual(testObject)

			component.unmount()
		})
	})

	test('EditorApp renders error when loading draft revision', () => {
		expect.assertions(4)

		APIUtil.getDraftRevision.mockResolvedValueOnce({ status: 'error' })
		EditorStore.getState.mockReturnValueOnce({})

		const props = {
			settings: {
				revisionId: 'mockId'
			}
		}
		const spy = jest.spyOn(EditorApp.prototype, 'loadDraftRevision')
		const component = mount(<EditorApp {...props} />)

		// eslint-disable-next-line no-undef
		return flushPromises().then(() => {
			component.update()

			expect(spy).toHaveBeenCalled()
			expect(component.state().requestStatus).toEqual('invalid')
			expect(component.state().requestError).toEqual('error')
			expect(component.state().mode).toEqual('visual')

			component.unmount()
		})
	})
})

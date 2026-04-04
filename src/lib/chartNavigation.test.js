import { describe, expect, it } from 'vitest'
import { getChartKeyboardState } from './chartNavigation'

describe('getChartKeyboardState', () => {
  it('moves focus through points with arrow keys', () => {
    const nextState = getChartKeyboardState({
      key: 'ArrowLeft',
      activeIndex: 4,
      pointCount: 8,
    })

    expect(nextState).toMatchObject({
      handled: true,
      activeIndex: 3,
      dragStartIndex: null,
      dragCurrentIndex: null,
    })
  })

  it('starts and extends a comparison range from the keyboard', () => {
    const startState = getChartKeyboardState({
      key: ' ',
      activeIndex: 5,
      pointCount: 8,
    })
    const extendState = getChartKeyboardState({
      key: 'ArrowLeft',
      shiftKey: true,
      activeIndex: startState.activeIndex,
      dragStartIndex: startState.dragStartIndex,
      dragCurrentIndex: startState.dragCurrentIndex,
      pointCount: 8,
    })

    expect(startState).toMatchObject({
      handled: true,
      activeIndex: 5,
      dragStartIndex: 5,
      dragCurrentIndex: 5,
    })
    expect(extendState).toMatchObject({
      handled: true,
      activeIndex: 4,
      dragStartIndex: 5,
      dragCurrentIndex: 4,
    })
  })

  it('clears chart keyboard state with escape', () => {
    const nextState = getChartKeyboardState({
      key: 'Escape',
      activeIndex: 2,
      dragStartIndex: 2,
      dragCurrentIndex: 6,
      pointCount: 8,
    })

    expect(nextState).toMatchObject({
      handled: true,
      activeIndex: null,
      dragStartIndex: null,
      dragCurrentIndex: null,
    })
  })
})

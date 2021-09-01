/*
 * @Author: Shirtiny
 * @Date: 2021-08-27 18:53:10
 * @LastEditTime: 2021-09-01 11:44:40
 * @Description:
 */

const trigger = (el, type) => {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}

const addListener = function (el, type, fn) {
  console.log('bind Listener', el.addEventListener, el, type, fn)
  el.addEventListener(type, fn, false)
}

export const replaceForbiddenChar = function (pre = '') {
  const rs = pre.trim().replace(/[`&<>:"/;'\\]/g, '')
  console.log('ReplaceForbiddenChar', pre, rs)
  return rs
}

const forbiddenCharReg = /<|>|:|;|"|'|&|\/|\\/gi

const forbiddenCharFilter = function (input) {
  let replaced = false
  addListener(input, 'keydown', e => {
    console.log('keydown', e.key)
    if (forbiddenCharReg.test(e.key)) {
      e.preventDefault()
    }
  })
  // 挡数据更新
  addListener(input, 'input', e => {
    console.log('input', e.target.value)
    if (replaced || !e.target.value) {
      replaced = false
      return
    }
    const v = e.target.value
    // 避免无法输入中文
    if (forbiddenCharReg.test(v)) {
      e.target.value = replaceForbiddenChar(e.target.value)
      replaced = true
      trigger(input, 'input')
    }
  })
}

export default {
  bind (el, binding) {
    let input = el
    const tagName = el.tagName.toLowerCase()
    if (tagName !== 'input' && tagName !== 'textarea') {
      input =
        el.querySelectorAll('input')[0] || el.querySelectorAll('textarea')[0]
    }
    switch (binding.arg) {
      case 'f': {
        forbiddenCharFilter(input)
        break
      }
      case 'f-iview-search': {
        setTimeout(() => {
          const input = el.querySelectorAll('input')[0]
          forbiddenCharFilter(input)
        }, 0)
        break
      }
      default:
        break
    }
  }
}

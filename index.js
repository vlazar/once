var proxy  = require('utilise.proxy')  
  , wrap   = require('utilise.wrap')  
  , sall   = require('utilise.sall')  
  , sel    = require('utilise.sel')  
  , is     = require('utilise.is')  

module.exports = function once(scope) {
  var parent = scope.node ? scope : sel(scope)
  return function o(selector, data, key, before) {
    if (arguments.length == 1) return once(sall(parent)(selector))
    var fn
      , enter = []
      , exit = []
      , els = []

    parent.each(function(paData, i){
      var self = this
      var elData = data
        , elSelector = selector

      if (is.fn(elSelector)) elSelector = elSelector(paData, i)
      if (is.fn(elData))     elData = elData(paData, i)
      if (!elData)           elData = []
      if (!is.arr(elData))   elData = [elData]

      var classes = elSelector instanceof HTMLElement
                  ? elSelector.className
                  : elSelector.split('.').slice(1).join(' ')

      var type    = elSelector instanceof HTMLElement
                  ? wrap(elSelector)
                  : elSelector.split('.')[0] || 'div'
      
      var el = sel(self)
        .selectAll(elSelector.toString())
        .data(elData, key)
  
      el.exit()
        .remove()
        .each(push(exit))

      el.enter()
        .insert(type, before)
        .classed(classes, 1)
        .each(push(enter))

      el.each(push(els))
    })

    els = sall()(els)
    fn = once(els)
    fn.enter = sall()(enter)
    fn.exit = sall()(exit)
    fn.sel = els

    ;['text', 'classed', 'html', 'attr', 'style', 'on'].map(function(op){
      fn[op] = proxy(els[op], wrap(fn), els)
    })

    return fn
  }
}

function push(arr) {
  return function(d){ 
    arr.push(this) 
  }
}
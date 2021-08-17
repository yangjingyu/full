function Full(config) {
  this.el = this.getEl(config.el)
  if (!(this.el instanceof HTMLElement)) {
    throw 'el must be Element or Selector!'
  }
  this.toggle = this.getEl(config.toggle)
  if (!(this.toggle instanceof HTMLElement)) {
    throw 'toggle must be Element or Selector!'
  }
  this.forceRotate = config.forceRotate || false
  this.disableScroll = config.disableScroll || false
  this.blank = this.insertBlank()
  this.bindToggle()
  this._style = this.el.getAttribute('style')

  this.css = {
    w: this.el.offsetWidth,
    h: this.el.offsetHeight,
  }

  this.type = -1

  var style = document.createElement("style");
  style.appendChild(document.createTextNode(".__is_full__{touch-action: none; overflow: hidden;}"));
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(style);

  this.autoRotate = config.autoRotate
  if (this.autoRotate) {
    this.bindOriginChange()
  }

  if (this.disableScroll) {
    this.touchmove()
  }

  this.onUpdate = function () { }
}

Full.prototype.getEl = function (el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  } else {
    return el
  }
}

Full.prototype.insertBlank = function () {
  var blank = document.createElement('div')
  var styles = [
    'position: absolute',
    'width: 100vw',
    'height: 100vh',
    'top: -10000px',
    'left: -10000px'
  ].join(';')
  blank.style = styles
  document.body.appendChild(blank)
  return blank
}

Full.prototype.getWH = function () {
  var data = {
    ow: this.blank.offsetWidth,
    oh: this.blank.offsetHeight,
    ww: window.innerWidth,
    wh: window.innerHeight,
    o: window.orientation
  }
  data.hasTools = data.h > data.wh
  data.w = Math.min(data.ow, data.ww)
  data.h = Math.min(data.oh, data.wh)
  return data
}

Full.prototype.bindToggle = function () {
  var that = this
  this.toggle.addEventListener('click', function () {
    var body = document.body
    if (!body.classList.contains('__is_full__')) {
      body.classList.add('__is_full__')
      that.getStyle(that.forceRotate ? 1 : 3)
      that.__is_full__ = true
      that.bindOriginChange()
    } else {
      body.classList.remove('__is_full__')
      that.getStyle(2)
      that.__is_full__ = false
    }
  })
}

Full.prototype.getStyle = function (boo) {
  var that = this
  var offset = that.getWH()
  this.type = boo
  switch (boo) {
    case 1:
      var trans = Math.abs(offset.w - offset.h) / 2
      that.el.style = this._style + [
        'width:' + offset.h + 'px',
        'height:' + offset.w + 'px',
        'position: fixed',
        'z-index: 99999',
        'transform:rotate(90deg) translate(' + trans + 'px, ' + trans + 'px)'
      ].join(';')
      break
    case 2:
      that.el.style = this._style
      break
    case 4:
      that.el.style = this._style + [
        'width:' + that.css.h + 'px',
        'height:' + that.css.w + 'px',
      ].join(';')
      break
    case 3:
      that.el.style = this._style + [
        'width:' + offset.ww + 'px',
        'height:' + offset.wh + 'px',
        'position: fixed',
        'z-index: 99999',
      ].join(';')
      break
  }
}

Full.prototype.bindOriginChange = function () {
  var that = this
  var body = document.body
  var w = this.css.w
  var update = function () {
    if (body.classList.contains('__is_full__') || that.autoRotate) {
      if (Math.abs(window.orientation) === 90) {
        that.getStyle(3)
      } else {
        if (!body.classList.contains('__is_full__')) {
          that.getStyle(2)
        } else {
          that.getStyle(that.forceRotate ? 1 : 3)
        }
      }
    } else {
      that.getStyle(2)
    }
    if (that.__is_full__ || that.autoRotate) {
      window.requestAnimationFrame(update)
    }

    if (that.el.offsetWidth !== w) {
      w = that.el.offsetWidth
      const data = {
        w: w,
        h: that.el.offsetHeight,
        ow: w,
        oh: that.el.offsetHeight,
        or: window.orientation
      }
      if (that.type === 1 || Math.abs(window.orientation) === 90) {
        data.ow = data.h
        data.oh = data.w
      }
      that.onUpdate && that.onUpdate(data)
    }
  }
  window.requestAnimationFrame(update)
}

Full.prototype.touchmove = function () {
  var body = document.body
  this.el.addEventListener('touchmove', function (event) {
    if (body.classList.contains('__is_full__')) {
      event.preventDefault();
    }
  }, { passive: false })
}

export default Full
module.exports = function(selector) {

  class srQuery {
    constructor(selector) {
      this.parents = null;
      this.isNodeList = false;
      if (selector === document || selector === window) {
        this.ele = selector;
      } else {
        this.isNodeList = true;
        this.ele = document.querySelectorAll(selector);
      }
    }

    attr(attribute, value = null) {
      let length = this.ele.length;
      if (value == null) {
        let index = length - 1;
        return this.ele[index].getAttribute(attribute);
      } else {
        let count = 0;
        [].forEach.call(this.ele, function(node) {
          node.setAttribute(attribute, value);
          count++;
        });
        if (count == length) {
          return true;
        } else {
          return false;
        }
      }
    }

    addClass(class_str) {
      let length = this.ele.length;
      let count = 0;
      [].forEach.call(this.ele, function(node) {
        node.classList.add(class_str);
        count++;
      });
      if (count == length) {
        return true;
      } else {
        return false;
      }
    }

    css(css_entry, value = null) {
      if (value == null) {
        let length = this.ele.length;
        let count = 0;
        [].forEach.call(this.ele, function(node) {
          for(let property in css_entry) {
            node.style[property] = css_entry[property];
          }
          count++;
        });
        if (count == length) {
          return true;
        } else {
          return false;
        }
      } else {
        let length = this.ele.length;
        let count = 0;
        [].forEach.call(this.ele, function(node) {
          node.style[css_entry] = value;
          count++;
        });
        if (count == length) {
          return true;
        } else {
          return false;
        }
      }
    }

    on(type, callback) {
      let response = false;
      switch(type) {
        case 'scroll':
          if (this.isNodeList) {
            let length = this.ele.length;
            let count = 0;
            [].forEach.call(this.ele, function(node) {
              node.addEventListener('scroll', function() {
                callback();
              });
              count++;
            });
            if (count == length) {
              response = true;
            }
          } else {
            this.ele.addEventListener('scroll', function() {
              callback();
            });
            response = true;
          }
        break;
        case 'click':
          if (this.isNodeList) {

          } else {
            
          }
        break;
      }
      return response;
    }

    parent() {
      this.parents = this.ele;

      let length = this.parents.length;
      let count = 0;
      [].forEach.call(this.parents, function(node) {
        node = node.parentElement;
        count++;
      });
      if (count == length) {
        return this;
      } else {
        return false;
      }
    }

    removeClass(class_str) {
      let length = this.ele.length;
      let count = 0;
      [].forEach.call(this.ele, function(node) {
        node.classList.remove(class_str);
        count++;
      });
      if (count == length) {
        return true;
      } else {
        return false;
      }
    }

    scrollTop() {
      if (this.isNodeList) {
        let length = this.ele.length;
        let index = length - 1;
        return this.ele[index].scrollTop();
      } else {
        return this.ele.scrollY;
      }
    }
  }

  return new srQuery(selector);
};
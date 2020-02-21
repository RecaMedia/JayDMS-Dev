import React from 'react';
import ReactDOM from 'react-dom';
import Curtain from '../components/curtain';

const modalRoot = document.getElementById('AdminModal');

const remove = () => {
  return ReactDOM.unmountComponentAtNode(modalRoot);
}

export default {
  show: (child) => {
    let node = <Curtain show={true} toggle={remove}>
      {child}
    </Curtain>;
    return ReactDOM.render(node, modalRoot);
  },
  remove  
}
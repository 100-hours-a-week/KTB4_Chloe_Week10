import render from './render.js'
function mount(container,vnode){
    const domNode = render(vnode);   // 1. VNode → 진짜 DOM
    container.appendChild(domNode);  // 2. 화면에 붙임

    // 이전 값 저장 (diff를 위해)
    container._prevVnode = vnode;
    
    // 어떤 실제 DOM 수정해야하는지 (patch를 위해)
    container._domNode = domNode;
}

export default mount;
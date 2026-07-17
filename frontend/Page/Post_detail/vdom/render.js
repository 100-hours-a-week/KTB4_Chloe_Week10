export default function render(vnode){

    //그냥 텍스트거나 숫자면 바로 텍스트 노드로 반환
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        
        return document.createTextNode(vnode);
    }

    //Vnode에 있는 태그를 보고 실제 DOM의 html 요소 생성 
    const domNode = document.createElement(vnode.type);

    // 가상 DOM의 속성을 Object.entries를 통해 [key, value]로 받아 html 요소에 할당
    for (const [k, v] of Object.entries(vnode.props)) {
        if (k === 'key') continue; // key는 실제 DOM 속성으로 안 나감

        if (k.startsWith('on')) {
            const eventName = k.slice(2).toLowerCase(); // onClick → click
            domNode.addEventListener(eventName, v);

            // 렌더할 때도 리스너 기억해두기 위해 속성으로 저장
            domNode._listeners = domNode._listeners || {};
            domNode._listeners[eventName] = v;
        } else {
            domNode.setAttribute(k, v);
        }
    }

    //가상 DOM의 자식 요소들을 재귀함수를 통해 html요소로 만들어 현재 요소에 할당
    for (const child of vnode.children) {
       domNode.appendChild(render(child))
    }

    return domNode;

}

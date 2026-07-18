import render from './render.js'

export function patch(domNode,patchObj){

    if (!patchObj) return; // 변경 없으면 스킵

    switch(patchObj.type){
        // 기존 노드 삭제
        case 'REMOVE':
            domNode.remove();
            break;
        //타입이 달라서 기존 노드를 새 노드로 완전 교체
        case 'REPLACE':
            domNode.replaceWith(render(patchObj.newVnode));
            break;
        //TEXT라서 값만 변경 (얘는 무조건 말단 노드)
        case 'TEXT':
            domNode.textContent = patchObj.newVnode;
            break;
        case 'UPDATE':
            patchProps(domNode, patchObj.propsPatches);     // toSet/toRemove 반영
            patchChildren(domNode, patchObj.childrenPatches, patchObj.newChildren); // 자식들 각각 재귀 patch
            break;
    }
        

}

function patchProps(domNode, { toSet, toRemove }) {
  for (const key in toSet) {
    if (key.startsWith('on')) {

      const eventName = key.slice(2).toLowerCase();

      // 예전 핸들러 제거 후 새 핸들러 등록
      if (domNode._listeners && domNode._listeners[eventName]) {
        domNode.removeEventListener(eventName, domNode._listeners[eventName]);
      }
      domNode.addEventListener(eventName, toSet[key]);

      // 다음 patch 때 "예전 핸들러가 뭐였는지" 알아야 지울 수 있으므로 저장해둠
      domNode._listeners = domNode._listeners || {};
      domNode._listeners[eventName] = toSet[key];

    } else if (key === 'className') {
      domNode.setAttribute('class', toSet[key]); 
    }
      else {
      domNode.setAttribute(key, toSet[key]);
    }
  }
  for (const key of toRemove) {
    //이벤트 처리
    if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();

        if (domNode._listeners && domNode._listeners[eventName]) {
            domNode.removeEventListener(eventName, domNode._listeners[eventName]);
            delete domNode._listeners[eventName];
    }
    } else if (key === 'className') {
      domNode.removeAttribute('class'); 
    }
    else {
        domNode.removeAttribute(key);
    }
  }
}

export function patchChildren(parentDomNode, childrenPatches, newChildVnode) {
  childrenPatches.forEach(childPatch => {
    if (childPatch.type === 'CREATE') {

        const newDom = render(childPatch.newVNode);
        // 댓글 5번을 등록한다고 가정
        // 댓글 5번을 등록하면 댓글 배열의 가장 앞단에 붙이기 때문에 
        // diffChildren에서 childPatch의 toIndex가 0으로 들어오게 됨 
        // 그런데, 지금 이 댓글 5번은 실제 DOM에 적용된게 아니기 때문에 
        // parentDomNode.children 에서 0번을 찾게 되면 댓글 4번 노드를 찾게 됨 
        parentDomNode.appendChild(newDom);

    } else if (childPatch.type === 'REMOVE') {
        // 여기서는 key값으로 돔 요소를 못찾으면 인덱스로 찾게끔 하고 있음 
        // 이렇게 하는 이유는 p 태그 같은 TEXT 요소는 key 값을 안가지고 있기 때문에 
        let targetDom = childPatch.key != null
            ? parentDomNode.querySelector(`[data-key="${childPatch.key}"]`)
            : null;
        if (!targetDom) targetDom = parentDomNode.childNodes[childPatch.fromIndex]; // 위에서 못찾으면 index를 통해서 targetDom 넣도록(풀백) 
        if (targetDom) targetDom.remove();

    } else if (childPatch.type === 'UPDATE') {
        let targetDom = childPatch.key != null
        ? parentDomNode.querySelector(`[data-key="${childPatch.key}"]`)
        : null;
        if (!targetDom) targetDom = parentDomNode.childNodes[childPatch.fromIndex]; 
        if (!targetDom) return; 

        // 진짜 diff 결과는 contentPatch 안에 있음 → 이걸 patch()에 넘겨야 함
        patch(targetDom, childPatch.contentPatch);

        // 위치 이동은 여기서 개별로 처리하지 않고, 아래 최종 재배치에서 한 번에 처리
        // (개별로 insertBefore 하면 CREATE/다른 UPDATE와 순서가 꼬여서 위치가 어긋남)
    }
  });

  // newChildVnode가 없으면(즉 key 기반 재배치가 필요없는 일반 자식들이면) 재배치 스킵
  if (!newChildVnode) return;

  // 모든 CREATE/REMOVE/UPDATE(내용)가 끝난 뒤,
  // newChildVnode(diff의 새 목표 순서) 그대로 DOM을 재배치
  // 이미 DOM에 붙어있는 노드를 다시 appendChild하면 "복사"가 아니라 "이동"이 되는 성질을 이용
  newChildVnode.forEach(vnode => {
    const key = (typeof vnode === 'string' || typeof vnode === 'number')
      ? null // 문자열/숫자 텍스트 노드는 key로 못 찾으므로 스킵 (댓글 li 구조에선 해당 없음)
      : vnode.props.key;

    if (key == null) return;

    const dom = parentDomNode.querySelector(`[data-key="${key}"]`);
    if (dom) parentDomNode.appendChild(dom); // 새 목록 순서대로 하나씩 맨 뒤로 옮기며 재정렬
  });
}
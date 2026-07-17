import render from './render.js'

export default function patch(domNode,patchObj){

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
            patchChildren(domNode, patchObj.childrenPatches); // 자식들 각각 재귀 patch
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

    } else {
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
    } else {
        domNode.removeAttribute(key);
    }
  }
}

function patchChildren(parentDomNode, childrenPatches) {
  childrenPatches.forEach(childPatch => {
    if (childPatch.type === 'CREATE') {
      parentDomNode.appendChild(render(childPatch.newVNode));
    } else if (childPatch.type === 'REMOVE') {
      const targetDom = parentDomNode.childNodes[childPatch.fromIndex];
      targetDom.remove();
    } else if (childPatch.type === 'UPDATE') {
      const targetDom = parentDomNode.childNodes[childPatch.fromIndex];

      // 진짜 diff 결과는 contentPatch 안에 있음 → 이걸 patch()에 넘겨야 함
      patch(targetDom, childPatch.contentPatch);

      // 위치가 바뀐 경우 실제 DOM도 옮겨줌
      if (childPatch.moved) {
        parentDomNode.insertBefore(targetDom, parentDomNode.childNodes[childPatch.toIndex]);
      }
    }
  });
}

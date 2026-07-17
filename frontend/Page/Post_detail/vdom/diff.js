import render from './render.js'

export default function diff(oldVnode,newVnode){
    //노드가 삭제된 경우
    if(!newVnode){
        return { 
            type: 'REMOVE' 
        };
    }

    //원래 없던 노드가 새로 생긴 경우
    if(!oldVnode){
        return {
            type : 'CREATE',
            newVNode
        }
    }

    //타입이 다른 경우 -> 태그가 아예 다른 경우
    if (oldVnode.type !== newVnode.type) {
        return { 
            type: 'REPLACE', 
            newVnode 
        };
    }

    //타입이 같은 경우 -> 태그가 변하지 않은 경우 (속성을 비교)

    //타입이 문자열이나 숫자인 경우
    if (typeof newVnode === 'string' || typeof newVnode === 'number') {
    
        //객체가 아니라서 그냥 값 비교! -> 내부 속성 비교
        if (oldVnode !== newVnode) {
            return { 
                type: 'TEXT', 
                newVnode 
            };
        }
            return null; // 값도 같으면 변경 없음
    }

    
    return {
        type: 'UPDATE',
        propsPatches: diffProps(oldVnode.props, newVnode.props),
        childrenPatches: diffChildren(oldVnode.children, newVnode.children)
    }



}

// 타입이 같은데 일반 요소 일때 (문자열이나 숫자가 아닐때)
// 내부의 속성을 제대로 비교해야한다.
function diffProps(oldProps,newProps){
  const toSet = {};
  const toRemove = [];

  for (const key in newProps) {
    //oldProps와 newProps가 다른게 있다면 새로 생기거나 변경되었다는 뜻
    if (oldProps[key] !== newProps[key]) {
      toSet[key] = newProps[key];
    }
  }

  for (const key in oldProps) {
    //oldProps에서 있는 값이 newProps에 없다면 삭제된 것 
    if (!(key in newProps)) {
      toRemove.push(key);
    }
  }

  return { toSet, toRemove };
}

function diffChildren(oldChildVnode,newChildVnode){
    const patches =[];

    // 1. oldChildren을 key 기준으로 빠르게 찾을 수 있게 Map 생성
    const oldMap = new Map();
    oldChildVnode.forEach((child, i) => {
        //key를 가져오거나(동적리스트) & index를 key로 사용(정적리스트)
        // child가 문자열/숫자면 props 자체가 없으므로, key는 무조건 index를 씀
        const key = (typeof child === 'string' || typeof child === 'number')
            ? i
            : (child.props.key ?? i);

        //key값으로 쉽게 자식 요소 쉽게 찾기 위해서 map 구조로 변환
        oldMap.set(key, { vnode: child, index: i });
    });

    // 2. newChildren을 순회하며 CREATE / UPDATE(+MOVE) 판단
    newChildVnode.forEach((newChild, newIndex) => {
        const key = (typeof newChild === 'string' || typeof newChild === 'number')
            ? newIndex
            : (newChild.props.key ?? newIndex);

        //new의 key값에 대응하는 객체가 old에도 있는지 확인 (조회해서 꺼냄) 
        //만약에 없으면 그 객체는 새로 생긴 애
        //있으면 속성&자식 비교 (재귀)
        const old = oldMap.get(key);

        if (!old) {
        // old에 없던 key → 새로 생김
        patches.push({ type: 'CREATE', newVNode: newChild, toIndex: newIndex });
        } else {
        // old에 있던 key → 내용 비교(재귀 diff)
        const contentPatch = diff(old.vnode, newChild);

        //만약에 old의 index 값이랑, new의 index값이 같아 -> 그러면 위치 변경이 없는거
        // 근데 index가 다르면 위치 변경을 한거 
        const moved = old.index !== newIndex;

        patches.push({
            type: 'UPDATE',
            contentPatch,      // 내부 props/children 변경사항
            moved,             // 위치가 바뀌었는지
            //old의 index에서 new의 index로 위치 변경
            fromIndex: old.index,
            toIndex: newIndex
        });

        oldMap.delete(key); // 매칭 완료 → 삭제 대상에서 제외
        }
    });

    // 3. oldMap에 남은 것 = new에 없는 것 = 삭제 대상
    oldMap.forEach(({ vnode, index }) => {
        patches.push({ type: 'REMOVE', fromIndex: index });
    });

    return patches;
}
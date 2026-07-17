 function createElement(type, props, ...children) {
    return {
        // 태그
        type,

        //속성 값
        props: props || {},

        //자식 요소
        children: children
            .flat(Infinity)                         
            .filter(child => child != null && child !== false && child !== true && child!=undefined) 
    }
}

export default createElement;
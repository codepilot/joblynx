'use strict';

function getKindOfSelector(selector) {
    switch(true) {
        case selector instanceof ChildSelector:
        case selector instanceof AllSelector:
        case selector instanceof DescendantSelector:
        case selector instanceof NextAdjacentSelector:
        case selector instanceof NextSiblingsSelector:
        case selector instanceof MultipleSelector:
            return 'relationship';

        case selector instanceof TagSelector:
        case selector instanceof IdSelector:
        case selector instanceof ClassSelector:
        case selector instanceof PseudoSelector:
        case selector instanceof PseudoFunctionSelector:
        case selector instanceof PseudoFunction1ArgQuotedSelector:
        case selector instanceof PseudoFunction1ArgSelector:
        case selector instanceof AttributeSelector:
        case selector instanceof AttributeEqualsSelector:
        case selector instanceof AttributeNotEqualsSelector:
        case selector instanceof AttributePrefixSelector:
        case selector instanceof AttributeContainsSelector:
        case selector instanceof AttributeContainsWordSelector:
        case selector instanceof AttributeEndsWithSelector:
        case selector instanceof AttributeStartsWithSelector:
            return 'elemental';
    }    
}

class Elemental extends String {
    constructor(...args) {
        super(args.join(''));
        this.args = args;
    }
}

function groupParseSelector(selectorText) {
    const ret = [];
    let elemental = [];
    parseSelector(selectorText).forEach((selector, si, parsed) => {
        const kind = getKindOfSelector(selector);
        //console.log(kind, selector);
        switch(kind) {
            case 'relationship':
                if(elemental.length) { ret.push(new Elemental(...elemental)); elemental = []; }
                ret.push(selector);
                break;
            case 'elemental':
                elemental.push(selector);
                break;
        }
    });
    if(elemental.length) { ret.push(new Elemental(...elemental)); elemental = []; }
    return ret;
}

//console.log(groupParseSelector('body>div.test1>span.redText'));

//    return;
function CssToHtml() {
    console.log('loaded');
    Array.prototype.forEach.call(document.styleSheets, (styleSheet)=> {
        Array.prototype.forEach.call(styleSheet.cssRules, (cssRule)=> {
            let previousSelector;
            groupParseSelector(cssRule.selectorText).forEach((selector, si, parsed) => {
                const partialArray = parsed.slice(0, si + 1);
                const partial = parsed.slice(0, si + 1).join('');
                try {
                    let selected = document.querySelector(partial);
                    if(selected === null) {
                        //console.log('need to create', selector, 'in', previousSelector);
                        if(selector instanceof Elemental) {
                            //console.log('elemental selector', selector);
                            let newElement;
                            selector.args.forEach((elementalPart) => {
                                switch(true) {
                                    case elementalPart instanceof TagSelector:
                                        newElement = document.createElement(`${elementalPart}`);
                                        selected = newElement;
                                        break;
                                    case elementalPart instanceof IdSelector:
                                        newElement.id = elementalPart.slice(1);
                                        break;                                    
                                    case elementalPart instanceof ClassSelector:
                                        newElement.classList.add(elementalPart.slice(1));
                                        break;
                                    case elementalPart instanceof AttributeEqualsSelector:
                                        newElement.setAttribute(elementalPart.executed[1], elementalPart.executed[2]);
                                        break;
                                    default:
                                        console.log('unhandled', elementalPart);
                                }
                            });
                            //console.log('newElement', newElement);
                            selected = previousSelector.appendChild(newElement);
                        }
                    } else {
                        //console.log({selector, partialArray, partial, selected});                        
                    }
                    previousSelector = selected;
                } catch( err ) {
                }
            });
            try {
                if(cssRule.style.content.length) {
                    //console.log('content', cssRule.style.content, previousSelector, cssRule.style);
                    previousSelector.innerHTML = JSON.parse(cssRule.style.content);
                }
            } catch(err) {

            }
        })
    });
}

/* document.addEventListener("DOMContentLoaded", CssToHtml); */

//window load is better event for lack of problems with displaying
window.addEventListener("load", CssToHtml);

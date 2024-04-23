import { handlerMethods } from "./decorators/handlerDecorator";

/**
 * This class performs some magic to make sure that the methods decorated with @handler can still call other private instance methods.
 * Since decorators run at the class level, not the instance level, a function annoted with @handler that calls an instance function prefixed with this 
 * (for example, a common helper method called like this.helper()) will lose its this context and not be able to call the instance function.
 * This super class will bind the this context for all annotated methods to the current instance of the class when it is instantiated (which happens in handler-utils::injectAllHandlers()).
 * All services must inherit this class and then they will not need to worry about calling functions with this.
 * TBH this pattern might not be a great idea, but it was fun to do and it's cool so I'm keeping it >:)
 */

export class BaseHandlerService{
    private readonly className: string;

    constructor(className: string){
        this.className = className;
        this.bindUnboundMethods();
    }


    private bindUnboundMethods() {
        const prototype = Object.getPrototypeOf(this);
        const methodNames = Object.getOwnPropertyNames(prototype).filter(name => typeof this[name] === 'function');

        methodNames.forEach(methodName => {
            if (this.shouldBind(methodName)) {
                this[methodName] = this[methodName].bind(this);
            }
        });
    }

    private shouldBind(methodName: string): boolean {
        //Functions will need their 'this' context bound if they are not the constructor and they are annoted with @handler
        return methodName !== 'constructor' && (handlerMethods[this.className]?.functions.includes(methodName));
    }
}
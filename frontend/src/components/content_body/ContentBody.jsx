import content_body_style from "./ContentBody.module.css";
function ContentBody ({className, children}) { //In React, when you pass child elements into a component, those child elements are available through the children prop. To render them, you need to explicitly include children in the JSX structure of the parent component.
    return(
        <div className={`${content_body_style.content_body} ${className}`}>
            {children} {/*children props rendered here*/}
        </div>
    );
}

export default ContentBody;
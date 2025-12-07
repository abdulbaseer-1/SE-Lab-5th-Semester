import { useState } from "react";
import ContentBody from "../content_body/ContentBody";
import content_style from "./Content.module.css";

function Content({className, children}) { // included children props because the content body will have components. So pass this into content body
                                         // also included className prop to pass styles for the children   
    const [sidebarVisibility, setSidebarVisibility] = useState(true);

    const isVisible = () => {
        setSidebarVisibility((prevState) => !prevState);
    };

    return(
        <div className={content_style.wrapper}>
            <div className={content_style.noSidebar}>
                <ContentBody className={`${content_style.contentBody} ${className}`}>
                    {children}
                </ContentBody>
            </div>
        </div>
    );   
};

export default Content;
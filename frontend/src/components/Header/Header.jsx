import header_style from "./Header.module.css";

function Header({className}) {
    return(
        <div className={`${header_style.header} ${className}`}>
           
            <h2 className={header_style.banner_title}>Accessibility Simulator</h2>
          
        </div>
    );
}

export default Header;
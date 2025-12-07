import header_style from "./Header.module.css";
import notification_logo from "../../assets/icons/notification.png";
import notification_active_logo from "../../assets/icons/notification_active.png";
import law_scales from "../../assets/banner/law_scales.png";
import user_icon from "../../assets/icons/login.png";

// import trailing_dove from "../../assets/banner/trailing_dove-removebg-preview.png";
function Header({className}) {
    let notification_count = 0; // to take from a backend function which checks notification count
    return(
        <div className={`${header_style.header} ${className}`}>
            <a href="/"><img src={law_scales} alt="logo image" className={header_style.banner_image_logo}/></a>
            <h2 className={header_style.banner_title}>Crime Report</h2>
            {/* <img src={trailing_dove} alt="trailing dove" className={header_style.banner_image_trailing_dove}/> */}
            {(notification_count === 0) ? (
            <a href="/" className={header_style.banner_image_notification_anchor}><img src={notification_logo} alt="bell icon" className={header_style.banner_image_notification}/></a>
            ) : (
                <a href="/" className={header_style.banner_image_notification_anchor}><img src={notification_active_logo} alt="bell icon" className={header_style.banner_image_notification}/></a>
            )
            }
            <a href="/" className={header_style.banner_image_user_anchor}><img src={user_icon} alt="user icon" className={header_style.banner_image_user}/></a>
        </div>
    );
}

export default Header;
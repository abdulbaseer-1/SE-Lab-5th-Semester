import switch_style from "./Hide_Button.module.css";
function Hide_Button({className,onClick}) {
    return(
        <label className= {`${switch_style.switch} ${className}`}>
            <input type="checkbox" defaultChecked onChange={onClick}/> {/* check note below */}
            <span className={switch_style.slider}></span>
        </label>

    );
};

export default Hide_Button;


/*
defaultChecked: This attribute ensures the checkbox is checked by default when the component is first rendered.
onChange: Keeps listening for changes to toggle the state as needed.
*/
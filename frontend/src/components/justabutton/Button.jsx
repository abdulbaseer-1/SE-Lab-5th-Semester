import Buttonstyle from './Button.module.css';

function Button({ className, children, onClick }) {
    return (
        <button onClick={onClick} className={`${Buttonstyle.button} ${className}`}>
            {children}
        </button>
    );
}

export default Button;